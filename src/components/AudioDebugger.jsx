import { useChat } from "../hooks/useChat";

export const AudioDebugger = ({ enabled = false }) => {
  const { message } = useChat();

  if (!enabled || !message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">🎵 Audio Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Text:</strong> {message.text?.substring(0, 50)}...
        </div>
        <div>
          <strong>Animation:</strong> {message.animation || "None"}
        </div>
        <div>
          <strong>Expression:</strong> {message.facialExpression || "None"}
        </div>
        <div>
          <strong>Audio:</strong>{" "}
          {message.audio ? `${message.audio.substring(0, 20)}...` : "No audio"}
        </div>
        <div>
          <strong>Lipsync:</strong>{" "}
          {message.lipsync
            ? `${message.lipsync.mouthCues?.length || 0} mouth cues`
            : "No lipsync"}
        </div>
        {message.lipsync?.mouthCues && (
          <div className="mt-2">
            <strong>Mouth Cues Preview:</strong>
            <div className="max-h-20 overflow-y-auto text-xs">
              {message.lipsync.mouthCues.slice(0, 5).map((cue, index) => (
                <div key={index}>
                  {cue.start}s-{cue.end}s: {cue.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
