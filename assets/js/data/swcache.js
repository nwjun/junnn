const resource = [ /* --- CSS --- */ '/junnn/assets/css/style.css', /* --- PWA --- */ '/junnn/app.js', '/junnn/sw.js', /* --- HTML --- */ '/junnn/index.html', '/junnn/404.html', '/junnn/categories/', '/junnn/tags/', '/junnn/archives/', '/junnn/about/', /* --- Favicons & compressed JS --- */ '/junnn/assets/img/favicons/android-chrome-192x192.png', '/junnn/assets/img/favicons/android-chrome-512x512.png', '/junnn/assets/img/favicons/apple-touch-icon.png', '/junnn/assets/img/favicons/favicon-16x16.png', '/junnn/assets/img/favicons/favicon-32x32.png', '/junnn/assets/img/favicons/favicon.ico', '/junnn/assets/img/favicons/mstile-150x150.png', '/junnn/assets/js/dist/categories.min.js', '/junnn/assets/js/dist/commons.min.js', '/junnn/assets/js/dist/home.min.js', '/junnn/assets/js/dist/misc.min.js', '/junnn/assets/js/dist/page.min.js', '/junnn/assets/js/dist/post.min.js', '/junnn/assets/js/dist/pvreport.min.js' ]; /* The request url with below domain will be cached */ const allowedDomains = [ 'nwjun.github.io', 'fonts.gstatic.com', 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'polyfill.io' ]; /* Requests that include the following path will be banned */ const denyUrls = [ ];
