import type { ReactForwardRef } from "./types";

type ModuleState = { state: "failed" } | { state: "succeeded"; value: unknown };

/**
 * Safely converts a value to its string representation.
 * Some Spotify webpack modules override `toString` to a non-function value,
 * causing `e.toString()` to throw `TypeError: e.toString is not a function`.
 * This helper uses `Function.prototype.toString.call()` for functions and
 * falls back gracefully for other types.
 */
function safeToString(value: unknown): string {
	try {
		if (typeof value === "function") {
			return Function.prototype.toString.call(value);
		}
		return String(value);
	} catch {
		return "";
	}
}

export class SpotifyModules {
	private static webpack: any | null = null;
	private static require: any | null = null;

	private static modules: unknown[] | null = null;
	private static loadedModules: Record<string, ModuleState> = {};

	private static init() {
		this.webpack = (window as any).webpackChunkclient_web ?? (window as any).webpackChunkopen;
		this.require = this.webpack.push([[Symbol()], {}, (re: any) => re]);

		this.refreshModules();
	}

	public static async loadFiles(files: number[]) {
		if (!this.require) this.init();

		await Promise.allSettled(files.map(f => this.require.e(f)));
		this.refreshModules();
	}

	private static refreshModules() {
		if (!this.require) this.init();

		this.loadedModules = {};

		const cache = Object.keys(this.require.m).map(id => this.require(id));
		this.modules = cache
			.filter(module => typeof module === "object")
			.map(module => {
				try {
					return Object.values(module);
				} catch {}
			})
			.flat();
	}

	private static getValue(cacheKey: string, modFn: () => ModuleState): unknown | null {
		if (!this.require) this.init();
		if (!(cacheKey in this.loadedModules)) this.loadedModules[cacheKey] = modFn();

		const state = this.loadedModules[cacheKey]!;
		if (state.state === "failed") return null;
		if (state.state === "succeeded") return state.value;
	}

	private static getValueFiltered(cacheKey: string, filterFn: (m: unknown) => unknown): unknown | null {
		return this.getValue(cacheKey, () => {
			const candidates = this.modules!.filter(filterFn);

			if (candidates.length === 1) {
				return {
					state: "succeeded",
					value: candidates[0]
				};
			} else {
				return {
					state: "failed"
				};
			}
		});
	}

	public static getMetadataService(): unknown | null {
		return this.getValueFiltered(
			"metadataService",
			m =>
				m &&
				typeof m === "function" &&
				"SERVICE_ID" in m &&
				m.SERVICE_ID === "spotify.mdata_esperanto.proto.MetadataService"
		);
	}

	public static getOfflinePlayableCache(): unknown | null {
		return this.getValueFiltered(
			"offlinePlayableCache",
			m =>
				m &&
				typeof m === "function" &&
				"SERVICE_ID" in m &&
				m.SERVICE_ID === "spotify.offline_playable_cache_esperanto.proto.OfflinePlayableCache"
		);
	}

	public static getCreateTransport(): unknown | null {
		return this.getValueFiltered(
			"createTransport",
			m =>
				m &&
				typeof m === "function" &&
				safeToString(m).includes("executeEsperantoCall") &&
				safeToString(m).includes("cancelEsperantoCall")
		);
	}

	public static getTrackList(): unknown | null {
		return this.getValueFiltered(
			"trackList",
			(m: any) =>
				m &&
				typeof m === "object" &&
				m["$$typeof"] === Symbol.for("react.memo") &&
				typeof m.type === "function" &&
				safeToString(m.type).includes("tracks") &&
				safeToString(m.type).includes("nrTracks") &&
				safeToString(m.type).includes("fetchTracks") &&
				safeToString(m.type).includes("itemsCache") &&
				safeToString(m.type).includes("initialItems")
		);
	}

	public static getTrackListItem(): unknown | null {
		return this.getValueFiltered(
			"trackListItem",
			(m: any) =>
				m &&
				typeof m === "object" &&
				m["$$typeof"] === Symbol.for("react.memo") &&
				typeof m.type === "function" &&
				safeToString(m.type).includes("displayedColumns") &&
				safeToString(m.type).includes("albumOrShow") &&
				safeToString(m.type).includes("associatedAudioUri")
		);
	}

	public static getCardRenderer(): ReactForwardRef | null {
		return this.getValueFiltered(
			"cardRenderer",
			m =>
				m &&
				typeof m === "object" &&
				"render" in m &&
				typeof m.render === "function" &&
				safeToString(m.render).includes("card-title-") &&
				safeToString(m.render).includes("card-subtitle-")
		) as ReactForwardRef | null;
	}

	public static getStyleSheetManager(): unknown | null {
		return this.getValueFiltered(
			"styleSheetManager",
			m =>
				m &&
				typeof m === "function" &&
				safeToString(m).includes("stylisPlugins") &&
				safeToString(m).includes("reconstructWithOptions") &&
				safeToString(m).includes("disableCSSOMInjection") &&
				safeToString(m).includes("disableVendorPrefixes")
		);
	}
}
