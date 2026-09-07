const payload = JSON.stringify({
  phone: "9876543210",
  password: "test1234",
});

async function main() {
  const health = await fetch("http://127.0.0.1:3000/api/health");
  console.log("HEALTH", health.status, await health.text());

  const login = await fetch("http://127.0.0.1:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
  const loginBody = await login.json();
  console.log("LOGIN", login.status, loginBody.user?.name || loginBody.error);

  if (!loginBody.token) process.exit(1);

  const me = await fetch("http://127.0.0.1:3000/api/auth/me", {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  const meBody = await me.json();
  const cid = meBody.memberships?.[0]?.community?.id;
  console.log("ME", me.status, meBody.user?.name, "community", cid);

  const feed = await fetch(
    `http://127.0.0.1:3000/api/requests?communityId=${cid}&scope=all`,
    { headers: { Authorization: `Bearer ${loginBody.token}` } }
  );
  const feedBody = await feed.json();
  console.log("FEED", feed.status, feedBody.requests?.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
