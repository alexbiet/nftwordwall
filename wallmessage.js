class WallMessage extends HTMLElement {
    constructor() {
      super();
        
      this.owner ="";
      this.message = "";
      this.txID = "";

      this.color = "";
      this.font = "";
      this.size = "";
      this.face = "";
      
    }
  
    connectedCallback() {

      this.color = this.getAttribute("color");
      this.font = this.getAttribute("font");
      this.size = this.getAttribute("size");
      this.face = this.getAttribute("face");

      this.message = this.getAttribute("message");
      this.owner = this.getAttribute("owner");
      this.txID = this.getAttribute("txid");

  
      this.render();
    }
  

  render() {

        this.innerHTML = `

        <div class="word ${this.color} ${this.font} ${this.size}">
                <div class="blur"></div>
                <img src="images/${this.face}.png" width="64" alt="${this.face}">
                <br><br>
                <p>${this.message}</p>
                <p><small><b>Created on  tx: </b><a href="https://mumbai.polygonscan.com/tx/${this.txID}" target="_blank">"${this.txID.substring(0,6) + '...' + this.txID.slice(-4)}</a><br><b>Owner: </b><a href="https://mumbai.polygonscan.com/address/${this.owner}" target="_blank">${this.owner.substring(0,6) + '...' + this.owner.slice(-4)}</a></small></p>
        </div><br>
                `;
    
    }

 
}
try{
customElements.define("wall-message", WallMessage);
} catch (err) {
    const h3 = document.createElement('h3')
    h3.innerHTML = "This site uses webcomponents which don't work in all browsers! Try this site in a browser that supports them!"
    document.body.appendChild(h3)
  }