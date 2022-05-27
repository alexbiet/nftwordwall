class WallMessage extends HTMLElement {
    constructor() {
      super();
        
      this.owner ="";
      this.message = "";
      this.color = "";
      this.font = "";
      this.size = "";
      this.duration = "";
      this.xcoord = "";
      this.ycoord = "";
    }
  
    connectedCallback() {

      this.color = this.getAttribute("color");
      this.font = this.getAttribute("font");
      this.size = this.getAttribute("size");
      this.duration = this.getAttribute("duration");

      this.xcoord = this.getAttribute("xcoord");
      this.ycoord = this.getAttribute("ycoord");

      this.message = this.getAttribute("message");
      this.owner = this.getAttribute("owner");
  
      this.render();
    }
  

  render() {

        this.innerHTML = `

        <div class="word ${this.color} ${this.font} ${this.size}">
                <div class="blur"></div>
                <p>${this.message}</p>
                <p><small><b>Strength: </b> 23/100 &nbsp; &nbsp; <b>Owner: </b><a href="https://mumbai.polygonscan.com/address/${this.owner}" target="_blank">${this.owner}</a></small></p>
        </div>
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