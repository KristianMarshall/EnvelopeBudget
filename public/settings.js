document.querySelector("a.nav-link.px-3").classList.add("active");

document.querySelector("#budgetButton").addEventListener("click", event =>{
    fetch("/settingsJson", {
        method: 'post',
        body: JSON.stringify({
            database: document.querySelector("#budgetDatabase").value
        }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if(result.serverStatus == 2)
                alert('Budget database changed successfully!', 'success');
            else
                alert(`Budget database failed: ${result.code}`, 'danger');
        });
});

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const alert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>', //TODO: maybe make this non dismissible
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)
}
