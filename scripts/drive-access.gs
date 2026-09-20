/**
 * Google Drive access for course students — one copy per Drive account.
 *
 * Each batch lives in a different Gmail account, and an account can only share
 * its own folders, so this script is deployed once inside each of those
 * accounts. The admin panel calls all of them at once; each one adds or removes
 * the student's email as a viewer on its own folder.
 *
 * Students are never emailed about the share (sendNotificationEmail: false),
 * they can only view, and downloading, printing and copying are switched off.
 * An hourly trigger locks anything newly uploaded, so new videos are covered
 * without touching this script again.
 *
 * Setup, in each Drive account:
 *   1. script.google.com -> New project, paste this file.
 *   2. Project Settings -> Script properties:
 *        FOLDER_ID  - the id in the folder's URL (drive.google.com/drive/folders/THIS)
 *        SECRET     - one long passcode, the same in all three accounts
 *   3. Run setUp() once and allow the permissions it asks for. It locks every
 *      file already in the folder and installs the hourly trigger.
 *   4. Deploy -> New deployment -> Web app, "Execute as: Me",
 *      "Who has access: Anyone", then copy the /exec URL.
 *   5. Paste the URLs and the passcode into the admin panel, once.
 *
 * The Drive REST API is called with UrlFetchApp and the script's own OAuth
 * token, so no advanced service has to be switched on by hand.
 *
 * Requests are POSTs with a JSON body: { secret, action, email }
 * where action is "grant", "revoke" or "status".
 */

var PROPS = PropertiesService.getScriptProperties();

/** Run once by hand after pasting the script. */
function setUp() {
  var folderId = PROPS.getProperty('FOLDER_ID');
  if (!folderId) throw new Error('Set the FOLDER_ID script property first');
  if (!PROPS.getProperty('SECRET')) throw new Error('Set the SECRET script property first');

  var folder = DriveApp.getFolderById(folderId);
  var locked = lockAllDownloads();

  // Only one hourly trigger, however many times this is run.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'lockAllDownloads') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('lockAllDownloads').timeBased().everyHours(1).create();

  var message = 'Folder "' + folder.getName() + '" ready. ' + locked +
    ' file(s) locked, hourly lock installed.';
  Logger.log(message);
  return message;
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PROPS.getProperty('SECRET');
    var folderId = PROPS.getProperty('FOLDER_ID');

    if (!secret || !folderId) return reply({ ok: false, error: 'Script properties SECRET and FOLDER_ID are not set' });
    if (body.secret !== secret) return reply({ ok: false, error: 'Wrong passcode' });

    var folder = DriveApp.getFolderById(folderId);
    var email = String(body.email || '').trim().toLowerCase();
    if (body.action !== 'status' && !email) return reply({ ok: false, error: 'No email given' });

    if (body.action === 'grant') {
      grantViewer(folderId, email);
      lockNewFiles(folder);
      return reply({ ok: true, folder: folder.getName(), action: 'granted', email: email });
    }

    if (body.action === 'revoke') {
      var removed = revokeAccess(folderId, email);
      return reply({ ok: true, folder: folder.getName(), action: 'revoked', email: email, removed: removed });
    }

    if (body.action === 'status') {
      var emails = listPermissions(folderId).map(function (p) { return (p.emailAddress || '').toLowerCase(); });
      return reply({
        ok: true, folder: folder.getName(),
        hasAccess: email ? emails.indexOf(email) !== -1 : null,
        viewerCount: emails.length
      });
    }

    return reply({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/** Drive REST v3, called with this script's own token. */
var DRIVE_API = 'https://www.googleapis.com/drive/v3/files/';

function driveCall(path, method, payload) {
  var options = {
    method: method,
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  };
  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  var res = UrlFetchApp.fetch(DRIVE_API + path, options);
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code >= 300) throw new Error('Drive API ' + code + ': ' + text.slice(0, 300));
  return text ? JSON.parse(text) : {};
}

/**
 * DriveApp's addViewer always emails the person. The REST API can do the same
 * share silently, which is what we want: the admin panel tells the student.
 */
function grantViewer(folderId, email) {
  driveCall(folderId + '/permissions?sendNotificationEmail=false&supportsAllDrives=true', 'post',
            { role: 'reader', type: 'user', emailAddress: email });
}

/** Removes the person however they were added - viewer, commenter or editor. */
function revokeAccess(folderId, email) {
  var removed = 0;
  listPermissions(folderId).forEach(function (p) {
    if ((p.emailAddress || '').toLowerCase() !== email) return;
    driveCall(folderId + '/permissions/' + p.id + '?supportsAllDrives=true', 'delete');
    removed++;
  });
  return removed;
}

function listPermissions(folderId) {
  var out = [];
  var pageToken = '';
  do {
    var res = driveCall(folderId + '/permissions?pageSize=100&supportsAllDrives=true' +
      '&fields=nextPageToken,permissions(id,emailAddress,role,type)' +
      (pageToken ? '&pageToken=' + pageToken : ''), 'get');
    out = out.concat(res.permissions || []);
    pageToken = res.nextPageToken || '';
  } while (pageToken);
  return out;
}

/**
 * Viewers can normally download, print or copy whatever they can open.
 * copyRequiresWriterPermission takes those buttons away. It cannot stop
 * someone recording their screen.
 */
function lockFile(fileId) {
  driveCall(fileId + '?supportsAllDrives=true', 'patch', { copyRequiresWriterPermission: true });
}

/** Everything in the folder and its sub-folders. Also the hourly trigger's job. */
function lockAllDownloads() {
  var folderId = PROPS.getProperty('FOLDER_ID');
  var count = walk(DriveApp.getFolderById(folderId));
  PROPS.setProperty('LOCKED_UNTIL', String(Date.now()));
  Logger.log('Locked ' + count + ' file(s)');
  return count;
}

/** Only files added since the last pass, so granting access stays fast. */
function lockNewFiles(folder) {
  var lastRun = Number(PROPS.getProperty('LOCKED_UNTIL') || 0);
  var files = folder.getFiles();
  var locked = 0;
  while (files.hasNext()) {
    var file = files.next();
    if (file.getDateCreated().getTime() <= lastRun) continue;
    try { lockFile(file.getId()); locked++; } catch (err) {}
  }
  return locked;
}

function walk(folder) {
  var count = 0;
  var files = folder.getFiles();
  while (files.hasNext()) {
    try { lockFile(files.next().getId()); count++; } catch (err) {}
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) count += walk(subs.next());
  return count;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
