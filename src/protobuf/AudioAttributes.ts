import { make, PBEnum, PBFloat64, PBMessage, PBString } from "./defs";

export enum Mode {
	Unknown = 0,
	Minor = 1,
	Major = 2
}

const PBMode = PBEnum({
	0: Mode.Unknown,
	1: Mode.Minor,
	2: Mode.Major
});

const CamelotKey = PBMessage({
	value: make(1, PBString),
	color: make(2, PBString)
});

const Key = PBMessage({
	key: make(1, PBString),
	mode: make(2, PBMode),
	camelotKey: make(3, CamelotKey)
});

export const AudioAttributesV2 = PBMessage({
	bpm: make(1, PBFloat64),
	key: make(2, Key)
});
