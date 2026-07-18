const apiRoot = window.Sonarr.apiRoot;

function createError(status, message) {
  return {
    status,
    responseJSON: {
      message
    }
  };
}

async function parseError(response) {
  const text = await response.text();

  if (!text) {
    return response.statusText || 'Interactive search failed';
  }

  try {
    return JSON.parse(text).message || text;
  } catch (error) {
    return text;
  }
}

export default function fetchReleaseStream(payload, onEvent) {
  const controller = new AbortController();
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'indexerIds') {
      value.forEach((indexerId) => params.append('indexerId', indexerId));
    } else if (value != null) {
      params.append(key, value);
    }
  });

  const request = fetch(`${apiRoot}/release/stream?${params.toString()}`, {
    headers: {
      Accept: 'application/x-ndjson',
      'X-Api-Key': window.Sonarr.apiKey
    },
    signal: controller.signal
  }).then(async(response) => {
    if (!response.ok) {
      throw createError(response.status, await parseError(response));
    }

    if (!response.body) {
      throw createError(
        response.status,
        'Streaming responses are not supported by this browser'
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let receivedComplete = false;

    const processLine = (line) => {
      if (!line.trim()) {
        return;
      }

      const event = JSON.parse(line);

      if (event.type === 'error') {
        throw createError(response.status, event.message);
      }

      if (event.type === 'complete') {
        receivedComplete = true;
      }

      onEvent(event);
    };

    let isDone = false;

    while (!isDone) {
      const { done, value } = await reader.read();
      isDone = done;

      if (isDone) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      lines.forEach(processLine);
    }

    buffer += decoder.decode();

    if (buffer) {
      processLine(buffer);
    }

    if (!receivedComplete) {
      throw createError(response.status, 'Interactive search stream ended unexpectedly');
    }
  });

  return {
    request,
    abortRequest: () => controller.abort()
  };
}
