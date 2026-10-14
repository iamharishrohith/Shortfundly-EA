import { NextResponse } from 'next/server';

export async function POST() {
  if (global.__campaignState) {
    global.__campaignState.killSwitch = true;
    global.__campaignState.isRunning = false;
  }
  return NextResponse.json({
    status: 'KILL_SWITCH_TRIGGERED',
    message: 'Campaign execution halted immediately'
  });
}
