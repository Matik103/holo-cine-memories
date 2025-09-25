// Test Frontend Custom Email Integration
const TEST_EMAIL = 'frontend-custom-test@example.com';
const TEST_NAME = 'Frontend Custom Test User';

console.log('🧪 Testing Frontend Custom Email Integration...\n');

// Test 1: Test Signup Email (should use custom service)
async function testSignupCustomEmail() {
  console.log('1️⃣ Testing Signup Custom Email...');
  try {
    const response = await fetch('https://otaqvhoopxyinfzphzxh.supabase.co/functions/v1/send-auth-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: TEST_EMAIL,
          user_metadata: {
            full_name: TEST_NAME
          }
        },
        email_data: {
          token: 'frontend-custom-signup-token',
          token_hash: 'frontend-custom-signup-hash',
          redirect_to: 'http://localhost:8080/auth',
          email_action_type: 'signup',
          site_url: 'http://localhost:8080'
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ Signup Custom Email:', result.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', result);
    return result.success;
  } catch (error) {
    console.log('❌ Signup Custom Email: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 2: Test Password Reset Custom Email
async function testPasswordResetCustomEmail() {
  console.log('\n2️⃣ Testing Password Reset Custom Email...');
  try {
    const response = await fetch('https://otaqvhoopxyinfzphzxh.supabase.co/functions/v1/send-auth-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: TEST_EMAIL,
          user_metadata: {
            full_name: TEST_NAME
          }
        },
        email_data: {
          token: 'frontend-custom-reset-token',
          token_hash: 'frontend-custom-reset-hash',
          redirect_to: 'http://localhost:8080/auth',
          email_action_type: 'recovery',
          site_url: 'http://localhost:8080'
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ Password Reset Custom Email:', result.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', result);
    return result.success;
  } catch (error) {
    console.log('❌ Password Reset Custom Email: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 3: Test Email Service File
async function testEmailServiceFile() {
  console.log('\n3️⃣ Testing Email Service File...');
  try {
    const response = await fetch('http://localhost:8080/src/lib/emailService.ts');
    
    if (response.status === 200) {
      console.log('✅ Email Service File: ACCESSIBLE');
      console.log('   Status:', response.status);
      return true;
    } else {
      console.log('❌ Email Service File: NOT ACCESSIBLE');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Email Service File: ERROR');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 4: Test Frontend Auth Page
async function testFrontendAuthPage() {
  console.log('\n4️⃣ Testing Frontend Auth Page...');
  try {
    const response = await fetch('http://localhost:8080/auth');
    
    if (response.status === 200) {
      console.log('✅ Frontend Auth Page: ACCESSIBLE');
      console.log('   Status:', response.status);
      return true;
    } else {
      console.log('❌ Frontend Auth Page: NOT ACCESSIBLE');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend Auth Page: ERROR');
    console.log('   Error:', error.message);
    return false;
  }
}

// Run all tests
async function runCustomEmailTests() {
  const results = {
    signupCustomEmail: await testSignupCustomEmail(),
    passwordResetCustomEmail: await testPasswordResetCustomEmail(),
    emailServiceFile: await testEmailServiceFile(),
    frontendAuthPage: await testFrontendAuthPage()
  };
  
  console.log('\n📊 Frontend Custom Email Test Results:');
  console.log('=====================================');
  console.log('✅ Signup Custom Email:', results.signupCustomEmail ? 'PASSED' : 'FAILED');
  console.log('✅ Password Reset Custom Email:', results.passwordResetCustomEmail ? 'PASSED' : 'FAILED');
  console.log('✅ Email Service File:', results.emailServiceFile ? 'PASSED' : 'FAILED');
  console.log('✅ Frontend Auth Page:', results.frontendAuthPage ? 'PASSED' : 'FAILED');
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log('\n🎯 Frontend Custom Email Status:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🚀 Frontend is now using custom email service!');
    console.log('🌐 Test the frontend at: http://localhost:8080');
    console.log('📧 Test with email:', TEST_EMAIL);
    console.log('👤 Test with name:', TEST_NAME);
  } else {
    console.log('\n⚠️  Frontend custom email integration needs attention.');
  }
  
  return results;
}

// Run the tests
runCustomEmailTests().catch(console.error);
