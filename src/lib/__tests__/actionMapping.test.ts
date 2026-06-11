// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  CSV_ACTION_TO_ACTION_NAME,
  CORRESPONDING_ACTION_TO_ACTION_NAME,
  csvActionToActionName,
} from '../actionMapping';

describe('CSV_ACTION_TO_ACTION_NAME', () => {
  it('maps known Airtable action strings to ActionNames', () => {
    expect(CSV_ACTION_TO_ACTION_NAME['accepts dropoff']).toBe('donate');
    expect(CSV_ACTION_TO_ACTION_NAME['accepts donations']).toBe('donate');
    expect(CSV_ACTION_TO_ACTION_NAME['buys']).toBe('sell');
    expect(CSV_ACTION_TO_ACTION_NAME['consigns']).toBe('consign');
    expect(CSV_ACTION_TO_ACTION_NAME['consigns/gives credit']).toBe('consign');
    expect(CSV_ACTION_TO_ACTION_NAME['sells']).toBe('buy');
    expect(CSV_ACTION_TO_ACTION_NAME['refills']).toBe('refill');
    expect(CSV_ACTION_TO_ACTION_NAME['repairs/fixes']).toBe('repair');
    expect(CSV_ACTION_TO_ACTION_NAME['composts']).toBe('compost');
    expect(CSV_ACTION_TO_ACTION_NAME['recycles']).toBe('recycle');
    expect(CSV_ACTION_TO_ACTION_NAME['trade']).toBe('trade');
    expect(CSV_ACTION_TO_ACTION_NAME['sells (b2b)']).toBe('buyB2B');
    expect(CSV_ACTION_TO_ACTION_NAME['processes']).toBe('process');
    expect(CSV_ACTION_TO_ACTION_NAME['processes (?)']).toBe('process');
    expect(CSV_ACTION_TO_ACTION_NAME['rents']).toBe('rent');
    expect(CSV_ACTION_TO_ACTION_NAME['needs volunteers']).toBe('volunteer');
    expect(CSV_ACTION_TO_ACTION_NAME['has restaurant or bar']).toBe('dineOrDrink');
    expect(CSV_ACTION_TO_ACTION_NAME['provides']).toBe('access');
  });

  it('has no blank or undefined values', () => {
    for (const [key, value] of Object.entries(CSV_ACTION_TO_ACTION_NAME)) {
      expect(value, `blank value for key "${key}"`).toBeTruthy();
    }
  });
});

describe('CORRESPONDING_ACTION_TO_ACTION_NAME', () => {
  it('maps canonical action labels from business_actions table', () => {
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['donate']).toBe('donate');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['drop off']).toBe('donate');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['buy']).toBe('buy');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['buy (b2b)']).toBe('buyB2B');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['sell']).toBe('sell');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['sell my items']).toBe('sell');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['consign']).toBe('consign');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['trade']).toBe('trade');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['repair']).toBe('repair');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['recycle']).toBe('recycle');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['compost']).toBe('compost');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['volunteer']).toBe('volunteer');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['refill']).toBe('refill');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['rent']).toBe('rent');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['process']).toBe('process');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['dine or drink']).toBe('dineOrDrink');
    expect(CORRESPONDING_ACTION_TO_ACTION_NAME['access']).toBe('access');
  });

  it('has no blank or undefined values', () => {
    for (const [key, value] of Object.entries(CORRESPONDING_ACTION_TO_ACTION_NAME)) {
      expect(value, `blank value for key "${key}"`).toBeTruthy();
    }
  });
});

describe('csvActionToActionName', () => {
  it('looks up CSV action map first', () => {
    expect(csvActionToActionName('Sells')).toBe('buy');
    expect(csvActionToActionName('Accepts Dropoff')).toBe('donate');
    expect(csvActionToActionName('Recycles')).toBe('recycle');
  });

  it('trims whitespace before matching', () => {
    expect(csvActionToActionName('  sells  ')).toBe('buy');
    expect(csvActionToActionName('\trecycles\t')).toBe('recycle');
  });

  it('is case-insensitive', () => {
    expect(csvActionToActionName('SELLS')).toBe('buy');
    expect(csvActionToActionName('Repairs/Fixes')).toBe('repair');
  });

  it('falls back to CORRESPONDING_ACTION_TO_ACTION_NAME for canonical labels', () => {
    expect(csvActionToActionName('donate')).toBe('donate');
    expect(csvActionToActionName('dine or drink')).toBe('dineOrDrink');
    expect(csvActionToActionName('drop off')).toBe('donate');
  });

  it('returns null for unknown strings', () => {
    expect(csvActionToActionName('unknown action')).toBeNull();
    expect(csvActionToActionName('')).toBeNull();
    expect(csvActionToActionName('ships')).toBeNull();
  });
});
