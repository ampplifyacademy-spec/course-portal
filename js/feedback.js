function fbFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fbUploadImage(file, uploadScriptUrl, label) {
  if (!file || !uploadScriptUrl) return Promise.resolve('');
  return fbFileToBase64(file).then(base64 => {
    return fetch(uploadScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fileData: base64, mimeType: file.type, fileName: label + ' - ' + file.name })
    }).then(r => r.json()).then(data => data.fileUrl || '');
  });
}

function fbSubmit(type, name, rating, quote, file, uploadScriptUrl) {
  return fbUploadImage(file, uploadScriptUrl, name).then(imageUrl => {
    return db.collection('feedback').add({
      type, name, rating, quote, imageUrl,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
}

function fbLoadApproved(type) {
  return db.collection('feedback').where('type', '==', type).where('status', '==', 'approved').get()
    .then(snap => snap.docs.map(d => d.data()))
    .catch(() => []);
}

function fbCard(f) {
  const stars = '★★★★★'.slice(0, Number(f.rating) || 5);
  return `
    <div class="testimonial-card">
      ${f.imageUrl ? `<img src="${f.imageUrl}" alt="${f.name}" style="width:100%; height:160px; object-fit:cover; border-radius:10px; margin-bottom:1rem;">` : ''}
      <div class="stars">${stars}</div>
      <p>"${f.quote}"</p>
      <div class="tname">${f.name}</div>
    </div>`;
}

function fbInitForm(formId, type, uploadScriptUrl) {
  const nameInput = document.getElementById(formId + 'Name');
  const ratingInput = document.getElementById(formId + 'Rating');
  const quoteInput = document.getElementById(formId + 'Quote');
  const fileInput = document.getElementById(formId + 'Image');
  const fileLabel = document.getElementById(formId + 'ImageLabel');
  const msg = document.getElementById(formId + 'Msg');
  const btn = document.getElementById(formId + 'Btn');
  let file = null;

  fileInput.addEventListener('change', () => {
    file = fileInput.files[0] || null;
    fileLabel.textContent = file ? file.name : 'Add a photo (optional)';
  });

  btn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const quote = quoteInput.value.trim();
    if (!name || !quote) {
      msg.style.color = 'var(--danger)';
      msg.textContent = 'Please enter your name and feedback.';
      return;
    }
    msg.style.color = 'var(--text-muted)';
    msg.textContent = 'Submitting...';
    btn.disabled = true;

    fbSubmit(type, name, ratingInput.value, quote, file, uploadScriptUrl)
      .then(() => {
        msg.style.color = 'var(--success)';
        msg.textContent = "Thanks! Your feedback will appear here once approved.";
        nameInput.value = '';
        quoteInput.value = '';
        fileInput.value = '';
        fileLabel.textContent = 'Add a photo (optional)';
        file = null;
        btn.disabled = false;
      })
      .catch(err => {
        msg.style.color = 'var(--danger)';
        msg.textContent = err.message;
        btn.disabled = false;
      });
  });
}
