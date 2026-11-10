/* the three screens; one shows at a time */
import { $ } from "./dom.js";
const SCREENS = ["home","player","done"];
export const show = name => SCREENS.forEach(s => { $(s).hidden = s!==name; });
export const showing = name => !$(name).hidden;
