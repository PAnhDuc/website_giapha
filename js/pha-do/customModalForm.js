export function renderCustomModalForm(title, fields) {
  return `
    <h3 class="modal-title">${title}</h3>
    <div class="modal-grid">
      ${fields
        .map((f) =>
          f.name === "photoUrl"
            ? `<div class="form-group form-group-full">
                <label>${f.label}</label>
                <input type="file" id="modal_photoUrl" accept="image/*" />
                <img id="imgPreview" class="img-preview" style="display:none;" />
              </div>`
            : `<div class="form-group">
                <label>${f.label}</label>
                <input type="text" id="modal_${f.name}" ${f.required ? "required" : ""} />
              </div>`
        )
        .join("")}
    </div>
    <button type="submit" style="margin-top:18px;width:100%;">Lưu</button>
  `;
}