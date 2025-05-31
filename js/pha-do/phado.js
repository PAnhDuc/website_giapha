let familyData = [
  { key: 1, name: "Trưởng Họ", gender: "male" }
];
let marriageLinks = []; // [ [chongKey, voKey] ]

function initDiagram() {
  const $ = go.GraphObject.make;
  const diagram = $(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true,
    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 })
  });

  diagram.nodeTemplate =
    $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle",
        { strokeWidth: 0, fill: "white" },
        new go.Binding("fill", "gender", g => g === "male" ? "#90caf9" : "#f48fb1")
      ),
      $(go.TextBlock, { margin: 8, font: "bold 14px sans-serif" },
        new go.Binding("text", "name"))
    );

  diagram.linkTemplate =
    $(go.Link, { routing: go.Link.Orthogonal, corner: 5 },
      $(go.Shape),
      $(go.Shape, { toArrow: "Standard" })
    );

  diagram.linkTemplateMap.add("Marriage",
    $(go.Link,
      { isTreeLink: false, isLayoutPositioned: false, selectable: false },
      $(go.Shape, { strokeWidth: 2, stroke: "red", strokeDashArray: [4, 2] })
    )
  );

  diagram.model = new go.GraphLinksModel(
    familyData,
    [
      ...familyData.flatMap(p => {
        // Hỗ trợ nhiều parent (cha/mẹ)
        if (Array.isArray(p.parents)) {
          return p.parents.map(pid => ({ from: pid, to: p.key }));
        } else if (p.parent) {
          return [{ from: p.parent, to: p.key }];
        }
        return [];
      }),
      ...marriageLinks.map(pair => ({ from: pair[0], to: pair[1], category: "Marriage" }))
    ]
  );
  return diagram;
}

function updateDiagram() {
  diagram.model = new go.GraphLinksModel(
    familyData,
    [
      ...familyData.flatMap(p => {
        if (Array.isArray(p.parents)) {
          return p.parents.map(pid => ({ from: pid, to: p.key }));
        } else if (p.parent) {
          return [{ from: p.parent, to: p.key }];
        }
        return [];
      }),
      ...marriageLinks.map(pair => ({ from: pair[0], to: pair[1], category: "Marriage" }))
    ]
  );
}

let diagram = initDiagram();

function updateRelationPersonOptions() {
  const select = document.getElementById("relationPerson");
  select.innerHTML = '<option value="">---</option>';
  familyData.forEach(person => {
    const option = document.createElement("option");
    option.value = person.key;
    option.textContent = person.name;
    select.appendChild(option);
  });
}

// Cập nhật danh sách cha/mẹ
function updateParentSelects() {
  const fatherSelect = document.getElementById("fatherSelect");
  const motherSelect = document.getElementById("motherSelect");
  fatherSelect.innerHTML = '<option value="">---</option>';
  motherSelect.innerHTML = '<option value="">---</option>';
  familyData.forEach(person => {
    if (person.gender === "male") {
      const option = document.createElement("option");
      option.value = person.key;
      option.textContent = person.name;
      fatherSelect.appendChild(option);
    }
    if (person.gender === "female") {
      const option = document.createElement("option");
      option.value = person.key;
      option.textContent = person.name;
      motherSelect.appendChild(option);
    }
  });
}

updateRelationPersonOptions();
updateParentSelects();

// Hiện/ẩn các select phù hợp với loại quan hệ
document.getElementById("relationType").addEventListener("change", function () {
  const val = this.value;
  document.getElementById("relationPerson").parentElement.style.display = (val === "parent" || val === "sibling" || val === "spouse") ? "" : "none";
  document.getElementById("parentSelects").style.display = (val === "parent") ? "" : "none";
});

document.getElementById("addPersonForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("personName").value.trim();
  const gender = document.getElementById("personGender").value;
  const relationType = document.getElementById("relationType").value;
  const relationPerson = document.getElementById("relationPerson").value;
  const father = document.getElementById("fatherSelect").value;
  const mother = document.getElementById("motherSelect").value;

  if (!name) return;

  const newKey = familyData.length ? Math.max(...familyData.map(p => p.key)) + 1 : 1;
  let newMember = { key: newKey, name, gender };

  if (relationType === "parent") {
    // Nếu chọn cha hoặc mẹ hoặc cả hai
    let parents = [];
    if (father) parents.push(Number(father));
    if (mother) parents.push(Number(mother));
    if (parents.length > 0) newMember.parents = parents;
  } else if (relationType === "sibling" && relationPerson) {
    const sibling = familyData.find(p => p.key == relationPerson);
    if (sibling && sibling.parents) newMember.parents = [...sibling.parents];
    else if (sibling && sibling.parent) newMember.parent = sibling.parent;
  } else if (relationType === "spouse" && relationPerson) {
    marriageLinks.push([Number(relationPerson), newKey]);
  } else if (relationType === "root") {
    // Không có parent
  }

  familyData.push(newMember);

  updateRelationPersonOptions();
  updateParentSelects();
  updateDiagram();
  this.reset();
  // Ẩn select cha/mẹ sau khi thêm
  document.getElementById("parentSelects").style.display = "none";
  document.getElementById("relationPerson").parentElement.style.display = "";
});
