# USE.md

## Overview
This document provides an explanation of the endpoints in the `SubscriberController` and their role in implementing the [WebSub](https://www.w3.org/TR/websub/) protocol. WebSub is a protocol for real-time notifications of content updates.

---

## Endpoints

### 1. **GET /callback**
#### Purpose
This endpoint is used for **hub verification** during the subscription process. When a subscriber registers a subscription with a hub, the hub sends a verification request to the subscriber's callback URL. The subscriber must respond with the `hub.challenge` value to confirm the subscription.

#### Query Parameters
- **`hub.mode`**:  
  - **Description**: The mode of the subscription request.  
  - **Example**: `subscribe` or `unsubscribe`.

- **`hub.topic`**:  
  - **Description**: The topic URL for which the subscription is being requested.  
  - **Example**: `order.created`.

- **`hub.challenge`**:  
  - **Description**: A random string provided by the hub that must be echoed back in the response.  
  - **Example**: `123456789`.

- **`hub.lease_days`**:  
  - **Description**: The duration (in days) for which the subscription is valid.  
  - **Example**: `365`.

#### Response
- **200 OK**: The response must include the `hub.challenge` value in the body to confirm the subscription.

#### Example Usage
```bash
GET /callback?hub.mode=subscribe&hub.topic=order.created&hub.challenge=123456789&hub.lease_days=365
```

---

### 2. **POST /callback**
#### Purpose
This endpoint is used to **receive content updates** from the hub. When the topic content is updated, the hub sends a POST request to the subscriber's callback URL with the updated content.

#### Headers
- **`x-hub-signature`**:  
  - **Description**: An HMAC signature used to verify the authenticity of the request.  
  - **Example**: `sha256=3c81cc9496e1c25250f6ccb85f697c1bb623e3480d6538ad8cb6a6648142777d`.

#### Body
- The body contains the updated content for the subscribed topic.

#### Behavior
1. If the `x-hub-signature` header is present, the subscriber verifies the signature using the shared secret.
2. If the signature is invalid, the request is ignored, but a `200 OK` response is still sent to prevent retries.
3. If the signature is valid (or not provided), the content is logged and acknowledged.

#### Response
- **204 No Content**: Acknowledges that the content was received successfully.

#### Example Usage with SUBSCRIBER_SECRET=s3cr3t
```bash
POST /callback
Headers:
  x-hub-signature: sha256=0adafcc1f0bec97866f1791582ed75ec59ec2b7d3a60fd151059d0aaaa1794de
Body:
  {
    "id": "123",
    "status": "created",
    "details": "Order created successfully"
  }
```

---

## Notes
- The `GET /callback` endpoint is critical for verifying the intent of the hub during subscription or unsubscription.
- The `POST /callback` endpoint is used to receive real-time updates for the subscribed topic.
- The `x-hub-signature` header ensures the integrity and authenticity of the content updates.

For more details on WebSub, refer to the [official specification](https://www.w3.org/TR/websub/).