// const nameInput = document.getElementById('name');            // ✅ სწორი ID
// const imageInput = document.getElementById('image-upload');   // ✅ სწორი ID
// const previewImg = document.getElementById('preview-img');
// const uploadBtn = document.getElementById('upload-btn');
// const startBtn = document.getElementById('start-tracking-btn');

// let uploadedImage = null;

// uploadBtn.addEventListener('click', () => {
//   imageInput.click();
// });

// imageInput.addEventListener('change', (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     previewImg.src = event.target.result;
//     uploadedImage = event.target.result;
//   };
//   reader.readAsDataURL(file);
// });

// startBtn.addEventListener('click', () => {
//   const name = nameInput.value.trim();

//   if (!name) {
//     alert('Please enter your name.');
//     return;
//   }

//   if (!uploadedImage) {
//     alert('Please upload an image.');
//     return;
//   }

//   localStorage.setItem('userName', name);
//   localStorage.setItem('userImage', uploadedImage);

//   window.location.href = 'index.html';
// });


const nameInput = document.getElementById('name');
const imageInput = document.getElementById('image-upload');
const previewImg = document.getElementById('preview-img');
const uploadBtn = document.getElementById('upload-btn');
const startBtn = document.getElementById('start-tracking-btn');
const errorMsg = document.getElementById('error-message');

let uploadedImage = null;

// Upload ღილაკი — ფაილის არჩევა
uploadBtn.addEventListener('click', () => {
  imageInput.click();
});

// ფაილის ვალიდაცია და წინასწარი ნახვა
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg'];

  // ვალიდაცია
  if (!validTypes.includes(file.type)) {
    errorMsg.innerHTML = `
      <div class="error-message">
        <img src="images/icons/error-icon.png" alt="error">
        Unsupported file type. Please upload a PNG or JPEG.
      </div>
    `;
    imageInput.value = ''; // reset input
    uploadedImage = null;
    previewImg.src = 'images/icons/avatar-placeholder.svg';
    return;
  }

  // ვალიდაცია გავიდა — წაშალე წინა შეცდომა
  errorMsg.innerHTML = '';

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImg.src = event.target.result;
    uploadedImage = event.target.result;

    // ვაშენებთ ცვლილებასაც — მხოლოდ ფოტო თუ შეიცვალა
    localStorage.setItem('userImage', uploadedImage);
  };
  reader.readAsDataURL(file);
});

// Start Tracking ღილაკზე
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();

  // სახელის ან ფოტოს ცალ-ცალკე ატვირთვის შესაძლებლობა
  if (!name && !uploadedImage) {
    alert('Please enter your name or upload an image.');
    return;
  }

  if (name) {
    localStorage.setItem('userName', name);
  }

  if (uploadedImage) {
    localStorage.setItem('userImage', uploadedImage);
  }

  // გადადით მთავარ გვერდზე
  window.location.href = 'index.html';
});
