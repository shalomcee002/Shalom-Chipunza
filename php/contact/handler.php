<?php
/**
 * Contact form API — POST only, returns JSON.
 */
declare(strict_types=1);

require_once __DIR__ . '/validate.php';
require_once __DIR__ . '/mail.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Honeypot — bots only
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
    exit;
}

$result = contact_validate_post();

if (!$result['ok']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(' ', $result['errors'])]);
    exit;
}

try {
    if (contact_send_mail($result['data'])) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
    } else {
        throw new RuntimeException('mail() returned false.');
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message. Please try again later or email shalomcee002@gmail.com directly.',
    ]);
}
