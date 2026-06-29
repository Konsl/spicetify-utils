import { make, PBFloat32, PBInt32, PBMessage, PBRepeatedPacked } from "./defs";

export const VocalActivity = PBMessage({
	sourceSampleRateHz: make(1, PBFloat32),
	smoothingWindowSize: make(2, PBInt32),
	firstWindowSampleStart: make(3, PBInt32),
	samplesBetweenWindows: make(4, PBInt32),
	vocalActivityProbabilities: make(5, PBRepeatedPacked(PBInt32))
});
