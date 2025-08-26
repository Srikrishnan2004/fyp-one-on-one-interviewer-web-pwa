import { useState, useEffect } from "react";

export const AudioPermissions = ({ children }) => {
  const [permissionStatus, setPermissionStatus] = useState("checking");
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAudioPermissions();
  }, []);

  const checkAudioPermissions = async () => {
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Your browser doesn't support audio recording. Please use Chrome, Firefox, or Edge."
        );
        setPermissionStatus("unsupported");
        return;
      }

      // Check permission status
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: "microphone",
        });

        if (permission.state === "granted") {
          setPermissionStatus("granted");
        } else if (permission.state === "denied") {
          setPermissionStatus("denied");
        } else {
          setPermissionStatus("prompt");
        }

        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      } else {
        // Fallback for browsers that don't support permissions API
        setPermissionStatus("prompt");
      }
    } catch (error) {
      console.error("Error checking audio permissions:", error);
      setError("Error checking microphone permissions");
      setPermissionStatus("error");
    }
  };

  const requestPermission = async () => {
    try {
      setError(null);
      setPermissionStatus("requesting");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately as we just needed to test permission
      stream.getTracks().forEach((track) => track.stop());

      setPermissionStatus("granted");
    } catch (error) {
      console.error("Error requesting audio permission:", error);
      if (error.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
        setPermissionStatus("denied");
      } else if (error.name === "NotFoundError") {
        setError(
          "No microphone found. Please connect a microphone and try again."
        );
        setPermissionStatus("error");
      } else {
        setError("Error accessing microphone: " + error.message);
        setPermissionStatus("error");
      }
    }
  };

  if (permissionStatus === "checking") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">
              Checking Audio Permissions
            </h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === "unsupported") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Browser Not Supported
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please use a modern browser like Chrome, Firefox, or Edge for the
              best experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === "denied" || permissionStatus === "error") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Microphone Access Required
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                "The AI Interviewer needs microphone access to hear your responses."}
            </p>
            <div className="space-y-3">
              <button
                onClick={requestPermission}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md font-semibold"
                disabled={permissionStatus === "requesting"}
              >
                {permissionStatus === "requesting"
                  ? "Requesting..."
                  : "Allow Microphone Access"}
              </button>
              <div className="text-xs text-gray-500">
                <p>🔒 Your audio is processed locally and securely</p>
                <p>
                  💡 You can revoke this permission anytime in browser settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === "prompt") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md mx-4">
          <div className="text-center">
            <div className="text-blue-500 text-4xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold mb-2">Microphone Setup</h3>
            <p className="text-gray-600 mb-4">
              To start your AI interview session, we need access to your
              microphone.
            </p>
            <button
              onClick={requestPermission}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md font-semibold mb-3"
              disabled={permissionStatus === "requesting"}
            >
              {permissionStatus === "requesting"
                ? "Requesting..."
                : "Enable Microphone"}
            </button>
            <div className="text-xs text-gray-500">
              <p>🔒 Your audio is processed securely</p>
              <p>💬 Speech is converted to text for the interview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If permission is granted, render children
  return children;
};
