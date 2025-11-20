import { fetch } from '@forge/api';

// Configuration
const ESP32_URL = 'https://simulation-as9lzsp2v-jitimay-josues-projects.vercel.app/command';
const TOTAL_SERVOS = 8;

// Map Jira Status to Servo Angle (0-180)
const STATUS_ANGLES = {
  'To Do': 0,
  'In Progress': 90,
  'Done': 180,
  'Blocked': 45 // Jitter or specific position
};

// Map Priority to Pump/Relay (Critical = Pump On)
const CRITICAL_PRIORITIES = ['Highest', 'High', 'Critical'];

export async function run(event, context) {
  console.log('Received event:', JSON.stringify(event));

  const issue = event.issue;
  const changelog = event.changelog;
  
  // 1. Determine Servo Action (Thread Movement)
  // Simple hashing to assign issue to a servo (0-7)
  const servoIndex = Math.abs(hashCode(issue.key)) % TOTAL_SERVOS;
  
  let status = issue.fields.status.name;
  let angle = STATUS_ANGLES[status] || 0; // Default to 0 if unknown

  await sendCommand({
    cmd: 'SERVO',
    id: servoIndex,
    val: angle
  });

  // 2. Determine Relay Action (Critical Alert)
  const priority = issue.fields.priority ? issue.fields.priority.name : 'Medium';
  if (CRITICAL_PRIORITIES.includes(priority)) {
    // Activate pump for 5 seconds then off (handled by Arduino or separate command)
    await sendCommand({
      cmd: 'RELAY',
      id: 0,
      val: 1 // ON
    });
    
    // Optional: Send OFF command after delay, but Forge functions are short-lived.
    // Better to tell Arduino "Pulse" or let Arduino handle timeout.
    // Here we'll just send ON, assuming Arduino handles logic or another event turns it off.
  }

  // 3. Determine Heartbeat (Stepper Speed)
  // In a real app, we might query recent activity. 
  // For this prototype, every event boosts speed temporarily.
  await sendCommand({
    cmd: 'STEPPER',
    id: 0,
    val: 100 // Set speed to 100 (arbitrary units)
  });
}

async function sendCommand(payload) {
  try {
    console.log(`Sending command to ${ESP32_URL}:`, payload);
    const response = await fetch(ESP32_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Failed to send command: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error sending command:', err);
  }
}

// Helper: Simple hash function for strings
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
