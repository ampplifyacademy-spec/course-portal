/**
 * Google Drive access for course students — one copy per Drive account.
 *
 * Each batch lives in a different Gmail account, and an account can only share
 * its own folders, so this script is deployed once inside each of those
 * accounts. The admin panel calls all of them at once; each one adds or removes
 * the student's email on its own folder.
 *
 * Setup (repeat in every Drive account):
 *   1. script.google.com -> New project, paste this file, name it "Course access".
 *   2. Project Settings -> Script properties, add two:
 *        FOLDER_ID  - the folder id from its Drive URL
 *                     (drive.google.com/drive/folders/THIS_PART)
 *        SECRET     - the same passcode in every account; keep it long
 *   3. Services -> add "Drive API" (identifier Drive), so downloads can be locked.
 *   4. Deploy -> New deployment -> Web app
 *        Execute as: Me        (it shares YOUR folder)
 *        Who has access: Anyone (the SECRET is what actually guards it)
 *      Authorise when asked, then copy the /exec URL.
 *   5. Paste the three URLs and the passcode into the admin panel, once.
 *
 * Requests are POSTs with a JSON body: { secret, action, email }
 * where action is "grant", "revoke" or "status".
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SECRET');
    var folderId = props.getProperty('FOLDER_ID');

    if (!secret || !folderId) return reply({ ok: false, error: 'Script properties SECRET and FOLDER_ID are not set' });
    if (body.secret !== secret) return reply({ ok: false, error: 'Wrong passcode' });

    var folder = DriveApp.getFolderById(folderId);
    var email = String(body.email || '').trim().toLowerCase();
    if (body.action !== 'status' && !email) return reply({ ok: false, error: 'No email given' });

    if (body.action === 'grant') {
      // addViewer both shares the folder and, for a Gmail address, gives that
      // account access to every file inside it.
      folder.addViewer(email);
      lockDownloads(folder);
      return reply({ ok: true, folder: folder.getName(), action: 'granted', email: email });
    }

    if (body.action === 'revoke') {
      folder.removeViewer(email);
      // A student who was added as an editor by hand would survive removeViewer.
      try { folder.removeEditor(email); } catch (err) {}
      return reply({ ok: true, folder: folder.getName(), action: 'revoked', email: email });
    }

    if (body.action === 'status') {
      var viewers = folder.getViewers().map(function (u) { return u.getEmail().toLowerCase(); });
      return reply({
        ok: true, folder: folder.getName(),
        hasAccess: email ? viewers.indexOf(email) !== -1 : null,
        viewerCount: viewers.length
      });
    }

    return reply({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

/**
 * Viewers can normally download or copy anything they can open. Turning on
 * copyRequiresWriterPermission on each file takes the download, print and copy
 * buttons away. It cannot stop someone recording their screen.
 *
 * Runs over files added since the last pass, so a grant stays fast; run
 * lockAllDownloads() by hand after uploading a new batch of videos.
 */
function lockDownloads(folder) {
  var props = PropertiesService.getScriptProperties();
  var lastRun = Number(props.getProperty('LOCKED_UNTIL') || 0);
  var now = Date.now();
  var files = folder.getFiles();
  var locked = 0;
  while (files.hasNext()) {
    var file = files.next();
    if (file.getDateCreated().getTime() <= lastRun) continue;
    try {
      Drive.Files.update({ copyRequiresWriterPermission: true }, file.getId());
      locked++;
    } catch (err) {}
  }
  props.setProperty('LOCKED_UNTIL', String(now));
  return locked;
}

/** Locks every file in the folder, including sub-folders. Run after new uploads. */
function lockAllDownloads() {
  var folderId = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
  var count = walk(DriveApp.getFolderById(folderId));
  Logger.log('Locked ' + count + ' file(s)');
  return count;
}

function walk(folder) {
  var count = 0;
  var files = folder.getFiles();
  while (files.hasNext()) {
    try {
      Drive.Files.update({ copyRequiresWriterPermission: true }, files.next().getId());
      count++;
    } catch (err) {}
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) count += walk(subs.next());
  return count;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
