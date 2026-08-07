const { getYoutubeMetadata } = require('../server/services/youtube');

(async () => {
  try {
    console.log('Testing getYoutubeMetadata...');
    const meta = await getYoutubeMetadata('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('Success:', meta);
  } catch (err) {
    console.error('Failed with error:', err);
  }
})();
