// protected api requests handler


/**
 * Makes request, if response 401, tries to get new access_token and does request again
 
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem("access_token");
  console.log(`apiFetch executed on ${url}`)

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(response)

  // if access_token expired
  if (response.status === 401) {
    console.log("User has invalid token, refreshing...")
    const refreshResponse = await fetch("/api/refresh", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (refreshResponse.ok) {
      console.log("Access_token refreshed successfuly. Doing request again...")

      const data = await refreshResponse.json();
      localStorage.setItem("access_token", data.access_token);
      token = data.access_token;

      // do request again
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
    } else {
      // if refresh_token expired also
      console.log("Access_token refreshing failed")
      // do something
      
    }
  }

  return response;
}
