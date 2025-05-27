let people = [];
let siblings = [];
let keyCounter = 1;
let myDiagram;

function initDiagram() {
  var $ = go.GraphObject.make;
  myDiagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 55,
      nodeSpacing: 30,
      setsPortSpot: false,
      setsChildPortSpot: false,
    }),
  });

  // Custom node template with action bar
  myDiagram.nodeTemplate = $(
    go.Node,
    "Vertical",
    {
      selectionAdorned: false,
      background: "transparent",
    },
    $(
      go.Panel,
      "Auto",
      {
        minSize: new go.Size(280, 80),
        maxSize: new go.Size(NaN, NaN),
        margin: new go.Margin(3, 3, 0, 3),
      },
      $(go.Shape, "Rectangle", {
        fill: "#fff3ce",
        stroke: "#8c6900",
        strokeWidth: 5,
      }),
      // Tên
      $(
        go.TextBlock,
        {
          margin: new go.Margin(15, 10, 12, 10),
          font: "bold 22px Segoe UI,Tahoma,Geneva,Verdana,sans-serif",
          stroke: "#63501f",
          textAlign: "center",
          editable: false,
          alignment: go.Spot.Center,
        },
        new go.Binding("text", "name")
      )
    ),
    // Action bar
    $(
      go.Panel,
      "Horizontal",
      {
        background: "#8c6900",
        alignment: go.Spot.Center,
        defaultAlignment: go.Spot.Center,
        margin: new go.Margin(0, 0, 0, 0),
        padding: new go.Margin(7, 0, 7, 0),
      },
      $(
        "Button",
        {
          margin: 3,
          background: "#fff3ce",
          click: function (e, btn) {
            e.stopPropagation();
            showAddChildMenu(btn.part.data.key, btn.elt(0).panel.panel);
          },
        },
        $(go.TextBlock, "Thêm con ▾", {
          margin: 2,
          font: "15px Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
          stroke: "#63501f",
        })
      ),
      $(
        "Button",
        {
          margin: 3,
          background: "#fff3ce",
          click: function (e, btn) {
            e.stopPropagation();
            showInfoModal(btn.part.data);
          },
        },
        $(go.TextBlock, "Xem chi tiết", {
          margin: 2,
          font: "15px Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
          stroke: "#63501f",
        })
      )
    )
  );

  myDiagram.linkTemplate = $(
    go.Link,
    { routing: go.Link.Orthogonal, corner: 5 },
    $(go.Shape, {
      class: "gojs-link",
      stroke: "#7d5b13",
      strokeWidth: 2.2,
    })
  );

  updateDiagram(true);
}

// Hiển thị floating form thêm con dưới node
function showAddChildMenu(parentKey) {
  closeAddChildMenu();

  const node = myDiagram.findNodeForKey(parentKey);
  if (!node) return;
  let diagramDiv = myDiagram.div;
  let existingForm = document.getElementById("addChildFormGoJS");
  if (existingForm) existingForm.remove();

  // Tìm vị trí node trên màn hình
  let position = node.actualBounds;
  let point = myDiagram.transformDocToView(position.center);

  let form = document.createElement("form");
  form.id = "addChildFormGoJS";
  form.style.position = "fixed";
  form.style.left = point.x - 110 + "px";
  form.style.top = point.y + 60 + "px";
  form.style.zIndex = 99999;
  form.style.background = "#fff3ce";
  form.style.border = "2px solid #8c6900";
  form.style.padding = "16px 26px 10px 26px";
  form.style.borderRadius = "5px";
  form.style.boxShadow = "0 2px 10px rgba(140,105,0,0.13)";
  form.innerHTML = `
          <div style="font-weight:bold;color:#63501f;margin-bottom:7px;">Thêm con cho: ${node.data.name}</div>
          <input type="text" id="addChildName" placeholder="Họ tên con" style="width:220px;margin-bottom:7px;height:28px;"/>
          <select id="addChildGender" style="margin-bottom:7px;width:220px;height:28px;">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <div style="text-align:right">
            <button type="submit" style="background:#8c6900;color:#fff;font-weight:bold;padding:4px 16px;border:none;border-radius:3px;margin-right:7px;">Thêm</button>
            <button type="button" id="cancelAddChildBtn" style="background:#c6a23a;color:#fff;font-weight:bold;padding:4px 12px;border:none;border-radius:3px;">Hủy</button>
          </div>
        `;
  document.body.appendChild(form);

  form.onsubmit = function (e) {
    e.preventDefault();
    let name = form.querySelector("#addChildName").value.trim();
    let gender = form.querySelector("#addChildGender").value;
    if (!name) {
      alert("Vui lòng nhập tên con!");
      return;
    }
    addPerson({
      name,
      gender,
      relationType: "parent",
      relationPersonKey: parentKey,
    });
    closeAddChildMenu();
  };
  form.querySelector("#cancelAddChildBtn").onclick = closeAddChildMenu;

  setTimeout(() => {
    window.addEventListener("mousedown", outsideAddChildFormClick);
  }, 50);
}
function closeAddChildMenu() {
  let existingForm = document.getElementById("addChildFormGoJS");
  if (existingForm) existingForm.remove();
  window.removeEventListener("mousedown", outsideAddChildFormClick);
}
function outsideAddChildFormClick(e) {
  const form = document.getElementById("addChildFormGoJS");
  if (form && !form.contains(e.target)) closeAddChildMenu();
}

function addPerson({ name, gender, relationType, relationPersonKey }) {
  const key = keyCounter++;
  let person = { key, name, gender };
  if (relationType === "parent" && relationPersonKey) {
    person.parent = Number(relationPersonKey);
  }
  people.push(person);
  addToDiagramModel(person);
}
// Thêm node/link vào model hiện tại, không reload lại cây
function addToDiagramModel(newPerson) {
  myDiagram.startTransaction("add node");
  myDiagram.model.addNodeData(newPerson);
  if (newPerson.parent) {
    myDiagram.model.addLinkData({
      from: newPerson.parent,
      to: newPerson.key,
    });
  }
  myDiagram.commitTransaction("add node");
}
function updateDiagram(isInitial = false) {
  const parentLinks = people
    .filter((p) => p.parent)
    .map((p) => ({ from: p.parent, to: p.key }));

  const nodeDataArray = [...people];
  const linkDataArray = [...parentLinks];

  if (isInitial) {
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
  }
  updateRelationPersonOptions();
}
function updateRelationPersonOptions() {
  const sel = document.getElementById("relationPerson");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">---</option>';
  people.forEach((p) => {
    const op = document.createElement("option");
    op.value = p.key;
    op.innerText = `[${p.key}] ${p.name}`;
    sel.appendChild(op);
  });
  sel.value = prev;
}
// Xem chi tiết thành viên
function showInfoModal(person) {
  const content = document.getElementById("infoModalContent");
  let html = `<p><span>Họ tên:</span> ${person.name}</p>`;
  html += `<p><span>Giới tính:</span> ${
    person.gender === "male" ? "Nam" : "Nữ"
  }</p>`;
  html += `<p><span>Mã thành viên:</span> ${person.key}</p>`;
  if (person.parent) {
    const parent = people.find((p) => p.key == person.parent);
    if (parent) html += `<p><span>Cha/Mẹ:</span> ${parent.name}</p>`;
  }
  const childs = people.filter((p) => p.parent === person.key);
  if (childs.length) {
    html += `<p><span>Con:</span> ${childs.map((c) => c.name).join(", ")}</p>`;
  }
  content.innerHTML = html;
  document.getElementById("infoModal").classList.add("active");
}
function closeInfoModal() {
  document.getElementById("infoModal").classList.remove("active");
}
function handleLogout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userData");
  window.location.href = "index.html";
}
document.addEventListener("DOMContentLoaded", () => {
  initDiagram();
});
document
  .getElementById("addPersonForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("personName").value.trim();
    const gender = document.getElementById("personGender").value;
    const relationType = document.getElementById("relationType").value;
    const relationPersonKey = document.getElementById("relationPerson").value;
    if (!name) return alert("Vui lòng nhập tên!");
    addPerson({ name, gender, relationType, relationPersonKey });
    document.getElementById("addPersonForm").reset();
    document.getElementById("relationType").value = "root";
    updateRelationPersonOptions();
  });
document
  .getElementById("relationType")
  .addEventListener("change", updateRelationPersonOptions);

window.addEventListener("click", function (event) {
  const infoModal = document.getElementById("infoModal");
  const addChildForm = document.getElementById("addChildFormGoJS");
  // Đóng modal khi click ngoài modal
  if (event.target === infoModal) {
    closeInfoModal();
  }
  // Đóng form thêm con khi click ngoài form
  if (
    addChildForm &&
    !addChildForm.contains(event.target) &&
    !event.target.closest(".gojs-node-actions")
  ) {
    closeAddChildMenu();
  }
});
// ESC để đóng modal hoặc form thêm con
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAddChildMenu();
    closeInfoModal();
  }
});
