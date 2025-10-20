#!/usr/bin/env node

import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing admin subscriptions API...');
    
    const response = await fetch('http://localhost:3000/api/admin/subscriptions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add authentication headers here
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
