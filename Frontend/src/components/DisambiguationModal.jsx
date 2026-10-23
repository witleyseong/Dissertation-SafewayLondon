import { useEffect, useRef, useState } from "react";

// shown when TfL found more than one place for what the user typed
// the user picks one for each unclear side and the search is sent again
export default function DisambiguationModal({ disambiguation, onResolve, onCancel }) {
    const dialogRef = useRef(null);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);

    const originOptions = disambiguation.origin || [];
    const destinationOptions = disambiguation.destination || [];
    const canContinue = (originOptions.length === 0 || origin) && (destinationOptions.length === 0 || destination);

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function renderOptions(options, selected, setSelected, name) {
        return (
            <ul className="candidate-list">
                {options.map((c) => {
                    const id = `${c.lat},${c.lon}`;
                    return (
                        <li key={id}>
                            <label className={selected === c ? "selected" : ""}>
                                <input type="radio" name={name} checked={selected === c} onChange={() => setSelected(c)} />
                                {c.name || id}
                            </label>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <dialog ref={dialogRef} className="modal" onCancel={onCancel}>
            <h2>Confirm location</h2>
            {originOptions.length > 0 && (
                <section>
                    <h3>Which starting point did you mean?</h3>
                    {renderOptions(originOptions, origin, setOrigin, "origin")}
                </section>
            )}
            {destinationOptions.length > 0 && (
                <section>
                    <h3>Which destination did you mean?</h3>
                    {renderOptions(destinationOptions, destination, setDestination, "destination")}
                </section>
            )}
            <div className="modal-actions">
                <button className="button" onClick={onCancel}>Cancel</button>
                <button className="button primary" disabled={!canContinue} onClick={() => onResolve(origin, destination)}>
                    Continue
                </button>
            </div>
        </dialog>
    );
}
