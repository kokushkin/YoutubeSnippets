addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Fetch and log a given request object
 * @param {Request} request
 */
async function handleRequest(request) {
  console.log("Got request", request);

  let url = new URL(request.url);

  const videoParams = parseImputStartEndParametersFromYoutubeAddress(
    request.url
  );
  console.log("Video params", videoParams);

  if (videoParams !== undefined) {
    const response = await fetch(url.origin);
    console.log("Got response", response);

    const metatags = generateMetaTags(videoParams);
    console.log("Metatags", metatags);

    // Read response body.
    const text = await response.text();

    // Modify it.
    const modified = text.replace(
      '<meta property="og:title" content="This is supposed to be replaced on the Edge with bunch of meta tags">',
      metatags
    );
    console.log("Page with metatags", modified);

    // Return modified response.
    return new Response(modified, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } else {
    return fetch(request);
  }
}

function parseImputStartEndParametersFromYoutubeAddress(address) {
  console.log("Parse parameters from start and end from browser address");
  // example https://10r7w.csb.app/?videoId=DPGDAZyQ44k&start=147&end=150
  const reg = /(.+?)\/\?videoId=(.+?)&start=(.+?)&end=(.+)/;
  const match = address.match(reg);

  if (match == undefined) return undefined;

  const videoId = match[2];
  const startTimeSec = match[3];
  const endTimeSec = match[4];

  return {
    videoId,
    startTimeSec,
    endTimeSec
  };
}

function generateMetaTags(videoParams) {
  return `
				<meta property="og:title" content="Youtube snippet from ${
          videoParams.startTimeSec
        } sec to ${videoParams.endTimeSec} sec." />
				<meta property="og:description" content="Test description just to see how it will look like. Not it's not automatically generated. I hope it'll look perfect. When we are going to regenerate it with edge computing. So keep watching." />
				<meta property="og:image" content="https://img.youtube.com/vi/${
          videoParams.videoId
        }/0.jpg" />
				<meta property="og:image:width" content="200" />
				<meta property="og:type" content="video" />
				<meta property="og:url" content="https://10r7w.csb.app/?videoId=${
          videoParams.videoId
        }&start=${videoParams.startTimeSec}&end=${videoParams.endTimeSec}">
				<meta property="og:video" content="https://www.youtube.com/watch?v=${
          videoParams.videoId
        }" />`;
}
