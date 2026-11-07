package com.vanir.mobile

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView
import android.webkit.WebViewClient
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

/**
 * React Native native module providing high-fidelity HTML-to-PDF printing capabilities.
 *
 * Utilizes a hidden, temporary [WebView] and Android's native [PrintManager] service
 * to convert HTML documents (e.g. flight tickets, visa receipts, booking confirmations)
 * into A4-formatted PDF documents or send them directly to physical printer spoolers.
 *
 * @param reactContext The [ReactApplicationContext] supplied by the React Native framework.
 */
class VanirPrintModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  /**
   * Strong reference to the active [WebView] used during rendering.
   * Prevents premature garbage collection while Android's [PrintManager] spools pages.
   */
  private var activePrintWebView: WebView? = null

  /**
   * Returns the unique module name exposed to JavaScript via `NativeModules.VanirPrint`.
   *
   * @return The string identifier `"VanirPrint"`.
   */
  override fun getName(): String = "VanirPrint"

  /**
   * Renders raw HTML string content in an invisible [WebView] and opens Android's system print spooler.
   *
   * The method runs WebView initialization and rendering on the main UI thread. It waits for inline
   * resources (e.g. Base64 logos and QR codes) to rasterize before dispatching a [PrintAttributes]
   * configuration with ISO A4 dimensions to [PrintManager].
   *
   * @param html The raw HTML markup string containing the document content to print.
   * @param jobName Optional custom title for the print job displayed in the Android system print UI.
   *                Defaults to `"Vanir_Official_Document"` if null or blank.
   * @param promise React Native [Promise] resolved with `true` when the print spooler opens successfully,
   *                or rejected if the activity is missing, closed, or rendering fails.
   */
  @ReactMethod
  fun printHtml(html: String, jobName: String?, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || activity.isFinishing) {
      promise.reject("NO_ACTIVITY", "Active screen is unavailable for PDF generation.")
      return
    }

    val safeJobName = (jobName?.takeIf { it.isNotBlank() } ?: "Vanir_Official_Document")
      .replace(Regex("[^A-Za-z0-9_\\- ]"), "_")

    UiThreadUtil.runOnUiThread {
      try {
        val webView = WebView(activity)
        webView.settings.apply {
          javaScriptEnabled = false
          loadsImagesAutomatically = true
          useWideViewPort = true
          loadWithOverviewMode = true
          domStorageEnabled = false
          allowFileAccess = false
        }

        var hasDispatched = false
        webView.webViewClient = object : WebViewClient() {
          override fun onPageFinished(view: WebView?, url: String?) {
            if (hasDispatched || view == null) return
            hasDispatched = true

            // Allow 180ms for inline Base64/SVG brand logos & QR codes to rasterize
            Handler(Looper.getMainLooper()).postDelayed({
              try {
                if (activity.isFinishing || activity.isDestroyed) {
                  promise.reject("ACTIVITY_CLOSED", "Screen closed before print dialog opened.")
                  return@postDelayed
                }
                val printManager =
                  activity.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                if (printManager == null) {
                  promise.reject("NO_PRINT_SERVICE", "Android PrintManager service unavailable.")
                  return@postDelayed
                }

                val adapter = view.createPrintDocumentAdapter(safeJobName)
                val attributes = PrintAttributes.Builder()
                  .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                  .setResolution(PrintAttributes.Resolution("vanir_pdf", "Vanir Official A4 PDF", 300, 300))
                  .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                  .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                  .build()

                printManager.print(safeJobName, adapter, attributes)
                promise.resolve(true)
              } catch (err: Throwable) {
                promise.reject("PRINT_FAILED", err.message ?: "Failed to open Android PDF spooler.", err)
              }
            }, 180L)
          }
        }

        activePrintWebView = webView
        webView.loadDataWithBaseURL(
          "https://vanirgroup.com/",
          html,
          "text/html",
          "UTF-8",
          null
        )
      } catch (err: Throwable) {
        promise.reject("WEBVIEW_INIT_FAILED", err.message ?: "Failed to initialize PDF renderer.", err)
      }
    }
  }
}
