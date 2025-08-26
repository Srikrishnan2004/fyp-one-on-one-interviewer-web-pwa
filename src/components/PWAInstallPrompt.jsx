import { useState, useEffect } from "react";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-pink-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-sm mb-2">Install AI Interviewer</h3>
        <p className="text-xs mb-3">
          Install this app on your device for the best interview experience!
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-pink-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallButton(false)}
            className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
