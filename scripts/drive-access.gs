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
  var openedUp = restrictLinkAccess(folderId);
  var locked = lockAllDownloads();

  // Only one hourly trigger, however many times this is run.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'lockAllDownloads') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('lockAllDownloads').timeBased().everyHours(1).create();

  var message = 'Folder "' + folder.getName() + '" ready. ' + locked +
    ' file(s) locked, hourly lock installed. Link sharing removed from ' +
    openedUp + ' item(s) - only invited emails can open it now.';
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
    var noEmailNeeded = body.action === 'handOverToProxy' || body.action === 'proxyStatus';
    if (body.action !== 'status' && !noEmailNeeded && !email) return reply({ ok: false, error: 'No email given' });

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

    // Classes now reach students through our own player, which reads Drive as
    // the service account. Their own Drive access is what would let a link be
    // forwarded, so it goes; the download lock then has nobody to protect the
    // files from, and it is what blocks the player from reading them.
    if (body.action === 'handOverToProxy') {
      var keep = String(body.serviceAccount || '').trim().toLowerCase();
      if (!keep) return reply({ ok: false, error: 'No serviceAccount given' });
      var peopleRemoved = removeEveryoneExcept(folderId, keep);
      var filesOpened = unlockAllDownloads();
      return reply({
        ok: true, folder: folder.getName(), action: 'handedOver',
        peopleRemoved: peopleRemoved, filesUnlocked: filesOpened
      });
    }

    if (body.action === 'proxyStatus') {
      var left = listPermissions(folderId).filter(function (p) { return p.role !== 'owner'; });
      return reply({
        ok: true, folder: folder.getName(),
        stillShared: left.map(function (p) { return (p.emailAddress || p.type) + ':' + p.role; })
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

/**
 * "Anyone with the link" would let a forwarded link open the course, so any
 * such permission is removed from the folder and from every file in it.
 * Access is then only what this script grants, email by email.
 */
function restrictLinkAccess(folderId) {
  var removed = 0;
  removed += dropAnyonePermissions(folderId);
  var folder = DriveApp.getFolderById(folderId);
  removed += walkRestrict(folder);
  return removed;
}

function dropAnyonePermissions(fileId) {
  var removed = 0;
  listPermissions(fileId).forEach(function (p) {
    if (p.type !== 'anyone' && p.type !== 'domain') return;
    try {
      driveCall(fileId + '/permissions/' + p.id + '?supportsAllDrives=true', 'delete');
      removed++;
    } catch (err) {}
  });
  return removed;
}

function walkRestrict(folder) {
  var removed = 0;
  var files = folder.getFiles();
  while (files.hasNext()) removed += dropAnyonePermissions(files.next().getId());
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    removed += dropAnyonePermissions(sub.getId());
    removed += walkRestrict(sub);
  }
  return removed;
}

/** The player's identity - the one account that keeps access after hand-over. */
var PROXY_SERVICE_ACCOUNT = 'class-video@ampplify-video.iam.gserviceaccount.com';

/**
 * Run once by hand, from the Run menu, when classes have moved to our player.
 *
 * Students no longer open Drive at all, so their access here is only a way for
 * a link to be forwarded: it is withdrawn. The per-file download lock is then
 * pointless - there is nobody left it could hide a button from - and it is the
 * very thing that stops the player reading the file, so it is dropped too.
 */
function handOverNow() {
  var folderId = PROPS.getProperty('FOLDER_ID');
  if (!folderId) throw new Error('Set the FOLDER_ID script property first');
  var folder = DriveApp.getFolderById(folderId);
  var people = removeEveryoneExcept(folderId, PROXY_SERVICE_ACCOUNT);
  var files = unlockAllDownloads();
  var message = 'Folder "' + folder.getName() + '": removed ' + people +
    ' person(s), ' + files + ' file(s) now readable by the player.';
  Logger.log(message);
  return message;
}

/**
 * Takes the folder back to just its owner and the player's service account.
 * Every student viewer goes, so a forwarded Drive link is worth nothing and
 * the course is reachable only through our portal.
 */
function removeEveryoneExcept(folderId, keepEmail) {
  var removed = 0;
  listPermissions(folderId).forEach(function (p) {
    if (p.role === 'owner') return;
    if ((p.emailAddress || '').toLowerCase() === keepEmail) return;
    try {
      driveCall(folderId + '/permissions/' + p.id + '?supportsAllDrives=true', 'delete');
      removed++;
    } catch (err) {}
  });
  return removed;
}

/**
 * While copyRequiresWriterPermission is set, Drive refuses alt=media to anyone
 * but the owner, which stops the player reading the file at all. Run this only
 * after removeEveryoneExcept: with no viewers left there is nobody a download
 * button could appear for.
 */
function unlockAllDownloads() {
  var count = unlockWalk(DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID')));
  PROPS.setProperty('DOWNLOADS_UNLOCKED', '1');
  Logger.log('Unlocked ' + count + ' file(s)');
  return count;
}

function unlockWalk(folder) {
  var count = 0;
  var files = folder.getFiles();
  while (files.hasNext()) {
    try {
      driveCall(files.next().getId() + '?supportsAllDrives=true', 'patch',
                { copyRequiresWriterPermission: false });
      count++;
    } catch (err) {}
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) count += unlockWalk(subs.next());
  return count;
}

/** Everything in the folder and its sub-folders. Also the hourly trigger's job. */
function lockAllDownloads() {
  // Once the player streams these files, re-locking them every hour would
  // quietly break every class.
  if (PROPS.getProperty('DOWNLOADS_UNLOCKED') === '1') {
    Logger.log('Downloads stay unlocked - the player streams these files');
    return 0;
  }
  var folderId = PROPS.getProperty('FOLDER_ID');
  var count = walk(DriveApp.getFolderById(folderId));
  PROPS.setProperty('LOCKED_UNTIL', String(Date.now()));
  Logger.log('Locked ' + count + ' file(s)');
  return count;
}

/** Only files added since the last pass, so granting access stays fast. */
function lockNewFiles(folder) {
  if (PROPS.getProperty('DOWNLOADS_UNLOCKED') === '1') return 0;
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
