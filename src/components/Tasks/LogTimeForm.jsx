// src/components/Tasks/LogTimeForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { logTimeForTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './LogTimeForm.css';

const LogTimeForm = ({ taskId, onTimeLogged }) => {
    // === NEW State for the Timer ===
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerIntervalRef = useRef(null); // To hold the interval ID

    // === Existing State for Manual Entry ===
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { hasPermission } = useAuth();
    
    // === NEW useEffect for the Timer Logic ===
    useEffect(() => {
        if (isTimerRunning) {
            // Start the interval when timer is running
            timerIntervalRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000); // Update every second
        } else {
            // Clear the interval when timer is stopped
            clearInterval(timerIntervalRef.current);
        }
        // Cleanup function to clear interval if the component unmounts
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    // === NEW Timer Control Functions ===
    const handleStartTimer = () => {
        setIsTimerRunning(true);
        setError('');
    };

    const handleStopTimer = async () => {
        setIsTimerRunning(false);
        // Calculate duration in minutes, rounding up
        const durationInMinutes = Math.ceil(elapsedTime / 60);
        
        // Use the manual submission logic to log the time
        await submitTime(durationInMinutes, `Live Timer Entry: ${notes}`);

        // Reset everything
        setElapsedTime(0);
        setNotes('');
    };

    // === REFACTORED Submission Logic ===
    const submitTime = async (minutes, entryNotes) => {
        setIsSubmitting(true);
        setError('');
        try {
            const timeData = {
                duration_minutes: minutes,
                notes: entryNotes,
            };
            const response = await logTimeForTask(taskId, timeData);
            onTimeLogged(response.data);
            return true; // Indicate success
        } catch (err) {
            setError('Failed to log time. Please try again.');
            return false; // Indicate failure
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // === UPDATED Manual Submission Handler ===
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!duration || isNaN(duration) || Number(duration) <= 0) {
            setError('Please enter a valid, positive number for minutes.');
            return;
        }
        const success = await submitTime(parseInt(duration, 10), notes);
        if (success) {
            setDuration('');
            setNotes('');
        }
    };

    // Helper to format the elapsed time for display
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // Permission check
    if (!hasPermission('LOG_TIME_OWN')) {
        return null;
    }

    return (
        <div className="log-time-container">
            <h4>Track Time</h4>
            {isTimerRunning ? (
                // --- TIMER VIEW ---
                <div className="timer-view">
                    <div className="timer-display">{formatTime(elapsedTime)}</div>
                    <div className="timer-notes">
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes for this session..."
                        />
                    </div>
                    <button onClick={handleStopTimer} className="btn-timer-stop" disabled={isSubmitting}>
                        Stop & Log Time
                    </button>
                </div>
            ) : (
                // --- MANUAL & START VIEW ---
                <>
                    <div className="start-timer-section">
                        <p>Work in real-time and we'll track it for you.</p>
                        <button onClick={handleStartTimer} className="btn-timer-start">
                            Start Timer
                        </button>
                    </div>

                    <div className="manual-entry-divider">
                        <span>OR</span>
                    </div>

                    <form onSubmit={handleManualSubmit} className="log-time-form">
                        <p>Add a past entry manually.</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="duration">Duration (minutes)</label>
                                <input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 60" required/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes">Notes (Optional)</label>
                                <input id="notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you work on?"/>
                            </div>
                        </div>
                        <button type="submit" className="btn-manual-log" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging...' : 'Log Manual Entry'}
                        </button>
                    </form>
                </>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default LogTimeForm;