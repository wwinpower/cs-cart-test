let data = [];

async function getDatabase() {
    const response = await fetch('/assets/scripts/data.json');

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    const dataJSON = await response.json();
    return dataJSON;
}

function init(data) {
    return {
        ...data,
        isSelected: false,
        base_charge_value: Number((Math.random() * 1000).toFixed(2)),
    };
}

getDatabase()
    .then((location) => {
        location = location.map(init);
        data.push(...location);
    })
    .catch((err) => console.error(err));

let box = document.querySelector('#select-1'),
    input = box.querySelector('input'),
    content = box.querySelector('ul'),
    base = document.querySelector('.base-cost'),
    baseInput = base.querySelector('input'),
    basеButton = base.querySelector('.base-btn'),
    baseContent = document.querySelector('.base-content');




function filterLetters(val, data) {
    // Текст приводим в нижний регистр
    val = val.toLowerCase();

    // Фильтрируем их по первым буквам
    let filtered = data.filter(({ name }) => name.toLowerCase().startsWith(val));

    //Отправляем данные в функцию для их создание если их больше 0 или закрываем блок
    filtered.length > 0 ? createContent(filtered) : contentClose();
}

function filterEvent(event) {
    //Проверяем на пустоту
    if (event.target.value !== '') {
        try {
            // Берем значение из Input
            let val = event.target.value;

            //Отправляем его на фильтрацию
            filterLetters(val, data);
        } catch (err) {
            console.error(err);
        }
    } else {
        // Если пустой массив то закрываем через класс hide
        contentClose();
    }
}

function contentClose() {
    let content = document.querySelector('.select-content');

    content?.classList?.add('hide');
}

function contentOpen() {
    let content = document.querySelector('.select-content');

    content?.classList?.add('show');
}

function select() {
    // Берем значение ID из атрибута li
    let _id = Number(this.parentNode.getAttribute('data-value'));

    // Находим элемент по его id
    let $elm = data.find(({ id }) => id === _id);

    //  Меняем значение select
    $elm.isSelected = !$elm.isSelected;

    // Проверяем значение select
    if ($elm.isSelected) {
        // Если isSelected true то записываем данные внутри input-а
        input.value = $elm.name;
        baseInput.value = $elm.base_charge_value;
        // Дальше добавляем измененный обект в основной массив
        data = data.map((o) => {
            if (o.id === _id) return $elm;
            o.isSelected = false;
            return o;
        });

        localStorage.setItem('data', JSON.stringify($elm))
        filterLetters($elm.name, data);
    } else {
        input.value = '';
        baseInput.value = '';
        filterLetters('', data);
    }
}

function createContent(filtered) {
    try {
        let content = document.createElement('ul');
        content.classList.add('select-content');
        box.lastChild.remove();

        for (let { id, name, isSelected } of filtered) {
            let li = document.createElement('li');
            li.setAttribute('data-value', id);

            let button = document.createElement('button');
            button.classList.add('btn');
            button.innerText = !isSelected ? 'Добавить' : 'Удалить';
            li.innerHTML += name + button.outerHTML;
            content.append(li);
        }

        box.append(content);

        let list = box.querySelectorAll('button');
        for (let i = 0; i < list.length; i++) {
            list[i].onclick = select;
        }
    } catch (err) {
        console.error(err);
    }
}

function getTemplateBase({base_charge_value}) {
    return `
    <article class="form-content">
      <div class="base-box">
          <div>
              <input type="number" value="1.000" step="0.001" class="base-box__input">
              <label for="">КГ</label>
          </div>
          <div>
              <input type="number" value="3.000" step="0.001" class="base-box__input">
              <label for="">КГ</label>
          </div>

          <div class="direction-column">
            <input type="text" value="0.00" step="0.01" class="base-box__price">
            <p>Итоговая стоимость: <strong>${base_charge_value}</strong> ₽</p>
          </div>
          <button class="base-btn base-remove">Удалить наценку</button>
      </div>
    </article>
  `;
}

function addBaseBox() {
    let data = JSON.parse(localStorage.getItem('data'))
    baseContent.innerHTML += getTemplateBase(data);

    document.querySelectorAll('.base-remove').forEach((m) => (m.onclick = removeBaseBox));
    document.querySelectorAll('.base-box__input').forEach((m) => (m.onchange = setThreeNumberDecimal));
    document.querySelectorAll('.base-box__price').forEach((m) => (m.onchange = setPrice));
}

function removeBaseBox() {
    this.parentNode.parentNode.remove();
}

function stopDefAction(e){
  e.preventDefault();
}

function setThreeNumberDecimal() {
  this.value = parseFloat(this.value).toFixed(3);
}

function setPrice(){
  let data = JSON.parse(localStorage.getItem('data'))
  let val = Number(this.value.replace(/,/gi, '.'));
  
  this.parentElement.lastElementChild.lastElementChild.innerText = parseFloat(val + data.base_charge_value).toFixed(2)

  this.value = val > 0 ? '+' + parseFloat(val).toFixed(2) : parseFloat(val).toFixed(2);
}

input.addEventListener('keyup', filterEvent);
document.body.addEventListener('click', contentClose);
basеButton.addEventListener('click', addBaseBox);
baseInput.addEventListener('keydown',stopDefAction)

