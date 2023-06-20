// ==UserScript==
// @name         CQOOC Enhance
// @namespace    https://www.cqooc.com/
// @version      0.1
// @description  cqooc enhance
// @author       omg-xtao
// @match        https://www.cqooc.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function () {
  "use strict";

  const searchUrl = `https://www.cqooc.com/json/test/result/search?`;

  function AddElement(q, score) {
    if (document.getElementById(q) !== null) {
      const scoreP = document.createElement("p");
      scoreP.style.color = "red";
      scoreP.innerHTML = `得分：${score}`;
      document.getElementById(q).appendChild(scoreP);
    } else {
      setTimeout(() => {
        AddElement(q, score);
      }, 100);
    }
  }

  if (window.location.pathname === "/learn/mooc/testing/do") {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("tid");
    if (tid === null) {
      return;
    }
    const ts = new Date().getTime();
    // 测验显示小题得分
    try {
      GM_xmlhttpRequest({
        method: "GET",
        url: searchUrl + `testID=${tid}&ts=${ts}`,
        headers: {
          referer: window.location.href,
        },
        onload: function (response) {
          const jsondata = JSON.parse(response.responseText);
          if (jsondata.data.length > 0) {
            const scoreData = jsondata.data[0].scoreLog;
            if (scoreData.length > 0) {
              const scoreLogData = scoreData[scoreData.length - 1];
              for (var q in scoreLogData) {
                AddElement(q, scoreLogData[q].get);
              }
            }
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
    // 测试复制答案
    function AddAnserButton() {
      const scoreDiv = document.getElementById("score");
      if (scoreDiv !== null) {
        const buttonDiv = document.createElement("p");
        buttonDiv.className = "time";
        const copyButton = document.createElement("span");
        copyButton.innerHTML = "复制答案&nbsp;&nbsp;";
        const pasteButton = document.createElement("span");
        pasteButton.innerHTML = "&nbsp;&nbsp;粘贴答案";
        buttonDiv.appendChild(copyButton);
        buttonDiv.appendChild(pasteButton);
        scoreDiv.appendChild(buttonDiv);
        copyButton.addEventListener("click", () => {
          const answer = [];
          document
            .querySelectorAll("input[checked=checked]")
            .forEach((item) => {
              answer.push(item.id);
            });
          GM_setClipboard(answer.join(","));
          alert("答案已复制到剪贴板");
        });
        pasteButton.addEventListener("click", () => {
          GM_notification({ highlight: true });
          navigator.clipboard.readText().then((text) => {
            const answer = text.split(",");
            answer.forEach((item) => {
              const input = document.getElementById(item);
              if (input !== null) {
                input.click();
              }
            });
            alert("答案已粘贴");
          });
        });
      } else {
        setTimeout(() => {
          AddAnserButton();
        }, 1000);
      }
    }

    AddAnserButton();
  }
})();
