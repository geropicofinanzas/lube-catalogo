export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (url.pathname.startsWith('/img/')) {
      return handleImage(url);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleImage(url) {
  var fileId = url.pathname.slice(5);
  if (!fileId || fileId.indexOf('/') !== -1) {
    return new Response('Bad request', { status: 400 });
  }

  var cache = caches.default;
  var cached = await cache.match(url.toString());
  if (cached) return cached;

  var size = url.searchParams.get('s') || '';
  var driveUrl = 'https://lh3.googleusercontent.com/d/' + fileId + (size ? '=' + size : '');

  var resp = await fetch(driveUrl);
  if (!resp.ok) {
    return new Response('Not found', { status: 404 });
  }

  var response = new Response(resp.body, {
    headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=2592000',
      'Access-Control-Allow-Origin': '*'
    }
  });

  await cache.put(url.toString(), response.clone());
  return response;
}
