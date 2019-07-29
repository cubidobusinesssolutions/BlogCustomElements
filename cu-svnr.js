const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            font-family: sans-serif;
        }
        #maskedSVNRInput {
            border: 2px solid tranparent;
        }
        .valid {
            border: 2px solid green;
        }
        .invalid {
            border: 2px solid red;
        }
    </style>
    <input id="maskedSVNRInput" placeholder="XXX XXX"  />
`;

class CuSVNR extends HTMLElement {
    $down = [];
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({
            'mode': 'open'
        });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$maskedSVNRInput = this._shadowRoot.querySelector('#maskedSVNRInput');

    }
    connectedCallback() {
        console.log('connected!');
        this.$maskedSVNRInput.addEventListener('keydown', this.inputKeyDown.bind(this));
        this.$maskedSVNRInput.addEventListener('keyup', this.inputKeyUp.bind(this));
        this.$maskedSVNRInput.addEventListener('keypress', this.inputKeyPress.bind(this));
        /*if(this.getAttribute('placeholder')) 
        {
            this.placeholder = this.getAttribute('placeholder');
        }*/
    }

    disconnectedCallback() {
        console.log('disconnected!');
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'placeholder':
                this.placeholder = newValue;
                break;
        }
    }
    static get observedAttributes() {
        return ['placeholder'];
    }

    set placeholder(value) {
        this._placeholder = value;
        this.$maskedSVNRInput.placeholder = this.formatedSVNValue(value);
    }

    get placeholder() {
        return this._placeholder;
    }

    emittValue() {
        const event = new Event('onValueChanged');
        event.data = {
            value: this.value,
            valid: this.valid,
            formatedValue: this.formatedValue(this.value)
        };
    }

    isNumber(event) {
        var charCode = event.keyCode;
        if (charCode > 32 && (charCode < 48 || charCode > 57)) {
            this.$down[event.keyCode] = false;
            event.preventDefault();
            return false;
        }
        return true;
    }

    inputKeyPress(event) {
        if (this.isNumber(event)) {

            var charCode = event.keyCode;
            if (this.$maskedSVNRInput.value.length > 12 &&
                ((charCode > 47 && charCode < 58) || (charCode > 95 && charCode < 106))
            ) {
                var posstart = this.$maskedSVNRInput.selectionStart;
                var posend = this.$maskedSVNRInput.selectionEnd;
                this.$maskedSVNRInput.value = this.$maskedSVNRInput.value.slice(0, -1);
                this.$maskedSVNRInput.setSelectionRange(posstart + 1, posend + 1);
                event.preventDefault();

            }
        }
    }

    inputKeyDown(event) {
        this.$down[event.keyCode] = true;
    }

    inputKeyUp(event) {
        var posstart = this.$maskedSVNRInput.selectionStart;
        var posend = this.$maskedSVNRInput.selectionEnd;
        var charCode = event.keyCode;
        console.log(charCode);

        if (this.$down[17] && this.$down[32]) {
            this.$maskedSVNRInput.value = this.$maskedSVNRInput.value.slice(0, -1);
            this.$maskedSVNRInput.setSelectionRange(posstart, posend);
        }
        if (event.keyCode === 32 || ((charCode > 47 && charCode < 58) || (charCode > 95 && charCode < 106))) {
            this.value = this.$maskedSVNRInput.value.replace(/\s/g, '');
            if (this.$maskedSVNRInput.selectionStart != this.$maskedSVNRInput.value.length && this.$maskedSVNRInput.value.length > 0) {
                console.log('lenth: ' + this.$maskedSVNRInput.value.length);
                console.log('start: ' + window.getSelection().getRangeAt(0).startOffset)
                //middle manipulation
                var newval = this.formatedSVNValue(this.value, '#');
                this.$maskedSVNRInput.value = newval.replace(/#/g, '').trim();
                this.$maskedSVNRInput.setSelectionRange(posstart, posend);
            }

            if (this.$maskedSVNRInput.value.length === 4 || this.$maskedSVNRInput.value.length === 7 || this.$maskedSVNRInput.value.length === 10)
                this.$maskedSVNRInput.value = this.$maskedSVNRInput.value + ' ';
            this.$maskedSVNRInput.setSelectionRange(posstart + 1, posend + 1);
            if (this.$maskedSVNRInput.value.length > 12) {
                this.$maskedSVNRInput.value = this.$maskedSVNRInput.value.substring(-1);
            }
        }
        //Checkformat reformat ist
        this.valid = this.validateSVNR();

        this.$down[event.keyCode] = false;

    }


    //pattern="[1-9][0-9]{3} [0-3][1-9] [0-1][1-9] [0-9]{2}" 
    validateSVNR() {
        if (this.value && this.value.length === 10) {
            const validationNR = this.value.substring(3, 4);
            const numbers = Array.from(this.value);
            const calcvalue = parseInt(numbers[0]) * 3 + parseInt(numbers[1]) * 7 + parseInt(numbers[2]) * 9 +
                parseInt(numbers[4]) * 5 + parseInt(numbers[5]) * 8 +
                parseInt(numbers[6]) * 4 + parseInt(numbers[7]) * 2 +
                parseInt(numbers[8]) * 1 + parseInt(numbers[9]) * 6;
            const calculeated = calcvalue % 11;
            if (parseInt(calculeated) === parseInt(validationNR)) {
                this.$maskedSVNRInput.className = 'valid';
                return true;
            }

        }
        this.$maskedSVNRInput.className = 'invalid';
        return false;
    }
    formatedSVNValue(value, placeholder = '0') {
        const fillednumber = value.padEnd(10, placeholder);
        return fillednumber.substring(0, 4) +
            ' ' + fillednumber.substring(4, 6) +
            ' ' + fillednumber.substring(6, 8) +
            ' ' + fillednumber.substring(8, 10);
    }

}

window.customElements.define('cu-svnr', CuSVNR);