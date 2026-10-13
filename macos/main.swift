import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ note: Notification) {
        webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 960, height: 900),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "Steno Finger Trainer"
        window.minSize = NSSize(width: 520, height: 600)
        window.contentView = webView
        window.center()
        window.setFrameAutosaveName("main")
        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(webView)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationDidBecomeActive(_ note: Notification) {
        window?.makeFirstResponder(webView)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)

let mainMenu = NSMenu()
let appItem = NSMenuItem()
mainMenu.addItem(appItem)
let appMenu = NSMenu()
appMenu.addItem(withTitle: "Hide Steno Finger Trainer", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit Steno Finger Trainer", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
appItem.submenu = appMenu
let windowItem = NSMenuItem()
mainMenu.addItem(windowItem)
let windowMenu = NSMenu(title: "Window")
windowMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
windowMenu.addItem(withTitle: "Close", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
windowItem.submenu = windowMenu
app.mainMenu = mainMenu
app.run()
