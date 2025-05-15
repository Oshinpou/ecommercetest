// Include this in any HTML page via <script src="image-viewer.js"></script>

async function loadImageFromToken(token, containerId) {
  if (!token || !containerId) return;

  const db = new PouchDB('bobomacx-stock');
  try {
    const result = await db.find({ selector: { token } });
    if (result.docs.length === 0) {
      document.getElementById(containerId).innerHTML = "Image not found.";
      return;
    }

    const image = result.docs[0].image;
    const imgTag = document.createElement("img");
    imgTag.src = image;
    imgTag.style.maxWidth = "100%";
    document.getElementById(containerId).appendChild(imgTag);
  } catch (e) {
    document.getElementById(containerId).innerHTML = "Error: " + e.message;
  }
}
