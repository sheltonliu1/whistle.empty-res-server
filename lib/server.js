
const formatData = (data, level) => {
  let finalData = JSON.parse(JSON.stringify(data));
  // let finalData = JSON.parse(data);
  if (level === "all") {
    finalData = null;
  } else {
    Object.keys(finalData).forEach((item) => {
      switch (level) {
        // data下的数组都置为null
        case "array":
          if (finalData[item] instanceof Array) {
            finalData[item] = null;
          }
          break;
        // data下的数组的每一项都置为null
        case "item":
          if (finalData[item] instanceof Array) {
            finalData[item] = finalData[item].map((item2) => null);
          }
          break;
        // data下的数组的每一项的任何属性都置为null
        case "attr":
          if (finalData[item] instanceof Array) {
            finalData[item] = finalData[item].map((item2) => {
              Object.keys(item2).forEach((item3) => {
                item2[item3] = null;
              });
              return item2;
            });
          }
          break;
        // data下的每个属性(data为对象或者数组)都置为null
        case "top":
        default:
          finalData[item] = null;
      }
    });
  }
  return finalData;
};

const whiteUrlList = ['/api/user/user/info', '/api/user/get_oa_user_info', '/woa/user/get_oa_user_info'];

module.exports = (server, options) => {
  // handle http request
  server.on('request', (req, res) => {
    const { ruleValue } = req.originalReq;
    // do something
    if (["all", "top", "array", "item", "attr"].includes(ruleValue)) {
      const client = req.request((svrRes) => {
        res.writeHead(svrRes.statusCode, svrRes.headers);
        let body;
        svrRes.on('data', (data) => {
          body = body ? Buffer.concat([body, data]) : data;
        });
        svrRes.on('end', () => {
          if (body && !whiteUrlList.includes(req.url)) {
            try {
              let resObj = JSON.parse(body.toString());
              if(resObj.data) {
                resObj.data = formatData(resObj.data, ruleValue);
              }
              res.end(JSON.stringify(resObj));
              // res.end(JSON.stringify(Object.keys(req)));
              // res.end(req.url);
            } catch (error) {
              res.end(body.toString())
            }
          } else {
            // res.end();
            req.passThrough();
          }
        });
      });
      req.pipe(client);
    } else {
      req.passThrough();
    }
    
  });

  // handle websocket request
  server.on('upgrade', (req, socket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on('connect', (req, socket) => {
    // do something
    req.passThrough();
  });
};
