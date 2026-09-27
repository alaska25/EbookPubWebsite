import { HONEYPOT_NAME } from "../hooks/useBotGuard.js";

// Positioned off-screen rather than display:none — some bots skip fields
// hidden that way, but still fill in anything positioned normally in the DOM.
// aria-hidden + tabIndex=-1 keep it out of the tab order and away from
// screen reader users.
export default function HoneyPotField({ value, onChange }) {
  return (
    <div className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor={HONEYPOT_NAME}>Leave this field blank</label>
      <input
        id={HONEYPOT_NAME}
        name={HONEYPOT_NAME}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}