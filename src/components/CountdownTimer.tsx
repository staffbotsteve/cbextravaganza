import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center bg-secondary/80 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[70px]"
        >
          <span className="font-display font-black text-primary-foreground text-2xl md:text-3xl">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="font-body text-primary-foreground/70 text-xs uppercase tracking-wider">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
