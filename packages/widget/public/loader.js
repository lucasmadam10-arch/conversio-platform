/**
 * Conversio Widget Loader
 * Paste this snippet in your website's <head> tag.
 * Replace 'YOUR_TENANT_SLUG' with your actual tenant slug.
 */
(function (w, d, s, slug) {
  w.Conversio =
    w.Conversio ||
    function () {
      (w.Conversio.q = w.Conversio.q || []).push(arguments);
    };
  w.Conversio._tenantSlug = slug;
  var js = d.createElement(s);
  js.async = true;
  js.src = "https://cdn.conversio.io/widget/latest/widget.js";
  js.setAttribute("data-tenant", slug);
  var first = d.getElementsByTagName(s)[0];
  first.parentNode.insertBefore(js, first);
})(window, document, "script", "YOUR_TENANT_SLUG");
