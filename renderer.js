document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM Content Loaded');

  document.getElementById('browseInputButton').addEventListener('click', async () => {
    console.log('Browse Input Button Clicked');
    const filePath = await window.electron.browseVideoFile();
    if (filePath) {
      document.getElementById('inputFile').value = filePath;
      document.getElementById('videoName').value = filePath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.');
    }
  });

  document.getElementById('browseOutputButton').addEventListener('click', async () => {
    console.log('Browse Output Button Clicked');
    const folderPath = await window.electron.browseOutputFolder();
    if (folderPath) {
      document.getElementById('outputFolder').value = folderPath;
    }
  });

  document.getElementById('keepNameButton').addEventListener('click', () => {
    const inputPath = document.getElementById('inputFile').value;
    document.getElementById('videoName').value = inputPath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.');
  });

  document.getElementById('encodeButton').addEventListener('click', async () => {
    const inputPath = document.getElementById('inputFile').value;
    const outputPath = document.getElementById('outputFolder').value;
    const videoName = document.getElementById('videoName').value;
    const encoder = document.getElementById('encoder').value;
    const format = document.getElementById('format').value;
    const resolution = document.getElementById('resolution').value;

    if (!inputPath || !outputPath || !videoName) {
      alert('Error: Please select the video file, output folder, and specify the video name.');
      return;
    }

    try {
      document.getElementById('loading-animation').style.display = 'flex';
      await window.electron.encodeVideo({ inputPath, outputPath, videoName, encoder, format, resolution });
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      document.getElementById('loading-animation').style.display = 'none';
    }
  });
});
