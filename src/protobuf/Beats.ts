import { PBUInt32, PBMessage, make, PBRepeated, PBString, PBFloat32 } from "./defs";

const Beat = PBMessage({
	time: make(1, PBFloat32),
	duration: make(2, PBFloat32),
	value: make(3, PBUInt32),
	beatConfidence: make(4, PBFloat32),
	downbeatConfidence: make(5, PBFloat32)
});

export const Beats = PBMessage({
	beatsPerBar: make(1, PBUInt32),
	beats: make(2, PBRepeated(Beat)),
	beatsHash: make(3, PBString)
});
