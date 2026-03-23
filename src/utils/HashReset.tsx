"use client";

import {useEffect} from "react";

/**
 * Clears any URL hash from the browser address bar after the component mounts.
 * Uses history.replaceState to update the URL without triggering a page reload.
 * @returns null - This component renders nothing.
 */
export default function HashReset() {
	useEffect(() => {
		if (window.location.hash) {
			history.replaceState(null, "", window.location.pathname);
		}
	}, []);
	return null;
}
