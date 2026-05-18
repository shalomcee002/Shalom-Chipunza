<?php
/**
 * Contact Form Handler for Shalom Chipunza Portfolio
 * Securely handles AJAX form submissions and sends emails.
 */

// Set response header to JSON
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// 1. Honeypot check for spam prevention
if (!empty($_POST['website'])) {
    // If the hidden website field is filled, it's likely a bot
    echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
    exit;
}

// 2. Sanitize and collect inputs
$name    = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
$email   = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$phone   = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS);
$subject_agenda = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS);

// 3. Validation
$errors = [];

if (empty($name) || strlen($name) < 3) {
    $errors[] = 'Name is too short.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address.';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Message is too short.';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// 4. Email configuration
$to = 'shalomcee002@gmail.com';
$email_subject = "New Portfolio Message: $subject_agenda";

// Construct email body
$timestamp = date('Y-m-d H:i:s');
$body = "
--- New Contact Form Submission ---
Timestamp: $timestamp

Name: $name
Email: $email
Phone: $phone
Subject: $subject_agenda

Message:
$message
-----------------------------------
";

// Headers to prevent injection and set sender info
$headers = [
    'From' => 'Portfolio Contact <no-reply@shalomchipunza.com>',
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=utf-8'
];

// 5. Send Email
// Note: On local development environments, mail() might need a configured SMTP server.
try {
    if (mail($to, $email_subject, $body, $headers)) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
    } else {
        throw new Exception('PHP mail() function failed.');
    }
} catch (Exception $e) {
    // Log error if needed: error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to send message. Please try again later.']);
}
