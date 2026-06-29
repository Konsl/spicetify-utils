import { make, PBInt32, PBMessage, PBRepeatedPacked } from "./defs";

export const ThreebandWaveforms = PBMessage({
	sampleRate: make(1, PBInt32),
	sampleWindowSizeMs: make(2, PBInt32),
	smoothingWindowSize: make(2, PBInt32),
	lows: make(3, PBRepeatedPacked(PBInt32)),
	mids: make(4, PBRepeatedPacked(PBInt32)),
	highs: make(5, PBRepeatedPacked(PBInt32))
});
