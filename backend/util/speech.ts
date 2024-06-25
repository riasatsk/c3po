import type { ServerWebSocket } from "bun";
import sdk from "microsoft-cognitiveservices-speech-sdk";

const subscriptionKey: string = Bun.env.SPEECH_KEY as string;
const serviceRegion: string = Bun.env.SPEECH_REGION as string;

function synthesizeSpeech(text: string, ws: ServerWebSocket<unknown>) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  speechSynthesizer.speakTextAsync(
    text,
    (result) => {
      speechSynthesizer.close();
      ws.send(result.audioData);
    },
    (error) => {
      console.log(error);
      speechSynthesizer.close();
    }
  );
}

export default synthesizeSpeech;
