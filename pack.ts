import * as coda from "@codahq/packs-sdk";

const fields = "id,summary,customFields(id,name,value(avatarUrl,buildLink,color(id),fullName,id,isResolved,localizedName,login,minutes,name,presentation,text))"

const xpathText = (selector, value)=>{
  var doc = new DOMParser({
		locator: {},
		errorHandler: { warning: function (w) { }, 
		error: function (e) { }, 
		fatalError: function (e) { console.error(e) } }
	}).parseFromString(value)
  var nodes = xpath.select(selector, doc)
  return nodes.map((n)=>{
	return n.toString();
  });
};

export const pack = coda.newPack();

pack.addNetworkDomain("youtrack.cloud");

pack.addFormula({
  name: "Issue",
  description: "Returns information about an issue.",

  parameters: [
	  coda.makeParameter({
		type: coda.ParameterType.String,
		name: "account",
		description: "The YouTrack user used to take this action(<orgname>:<token>).",
	  }),
	coda.makeParameter({
	  type: coda.ParameterType.String,
	  name: "keyOrUrl",
	  description: "The key to an issue (CODA-42) or the full URL to the issue (https://coda.youtrack.cloud/issue/CODA-42)",
	}),
  ],

  resultType: coda.ValueType.String,

  execute: async function ([account, keyOrUrl], context) {
	let parts = account.split(':');
	let orgName = parts.shift();
	let token = parts.join(':');
	let key = keyOrUrl || '';
	if(key.indexOf('://') !== -1) key = ket.split('/').pop();
	let requestParams = {
	  method: "GET",
	  url: `http://${orgName}.youtrack.cloud/api/issues/${key}?fields=${fields}`,
	  headers : {  'Authorization': `Bearer perm:${token}` }
	};
	let response = await context.fetcher.fetch(requestParams);
	let ob = response.body;
	ob.key = key;
	let custom = ob.customFields;
	delete ob.customFields;
	custom.forEach((item)=>{
		if(item.name){
			ob[item.name] = item.value?.name || null;
		}
	});
	const text = Object.keys(ob).map((key)=>`${key}: ${ob[key]}`).join("\n");
	return text;
  },
});
