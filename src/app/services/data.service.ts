import { Injectable } from '@angular/core';
import { filter } from 'minimatch';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor() { }
  img: any;
  encode64(data) {
    var r = "";
    for (var i = 0; i < data.length; i += 3) {
      if (i + 2 == data.length) {
        r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
      } else if (i + 1 == data.length) {
        r += this.append3bytes(data.charCodeAt(i), 0, 0);
      } else {
        r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1),
          data.charCodeAt(i + 2));
      }
    }
    return r;
  }

  append3bytes(b1, b2, b3) {
    var c1 = b1 >> 2;
    var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    var c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    var c4 = b3 & 0x3F;
    var r = "";
    r += this.encode6bit(c1 & 0x3F);
    r += this.encode6bit(c2 & 0x3F);
    r += this.encode6bit(c3 & 0x3F);
    r += this.encode6bit(c4 & 0x3F);
    return r;
  }

  encode6bit(b) {
    if (b < 10) {
      return String.fromCharCode(48 + b);
    }
    b -= 10;
    if (b < 26) {
      return String.fromCharCode(65 + b);
    }
    b -= 26;
    if (b < 26) {
      return String.fromCharCode(97 + b);
    }
    b -= 26;
    if (b == 0) {
      return '-';
    }
    if (b == 1) {
      return '_';
    }
    return '?';
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  toImageNode(document: Document) {
    var rects: any = document.getElementsByTagName('rect');
    var list = Array.from(rects);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('rx') != null) {
        var ns = 'http://www.w3.org/2000/svg'
        var image = document.createElementNS(ns, 'image');
        image.setAttributeNS(null, 'filter', element.getAttribute('filter'))
        image.setAttributeNS(null, 'width', element.getAttribute('width'))
        image.setAttributeNS(null, 'height', element.getAttribute('height'))
        image.setAttributeNS(null, 'x', element.getAttribute('x'))
        image.setAttributeNS(null, 'y', element.getAttribute('y'))
        image.setAttributeNS(null, 'href', this.img)
        element.parentNode.replaceChild(image, element);
      }
    });
  }

  toEllipseNode(document: Document) {
    var rects: any = document.getElementsByTagName('rect');
    var list = Array.from(rects);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('rx') != null) {
        var ns = 'http://www.w3.org/2000/svg'
        var ellipse = document.createElementNS(ns, 'ellipse');
        var rx = ((element.getAttribute('width') as unknown as number) / 2);
        var ry = ((element.getAttribute('height') as unknown as number) / 2);
        var cx = (+(element.getAttribute('x') as unknown as number) + rx);
        var cy = (+(element.getAttribute('y') as unknown as number) + ry);
        ellipse.setAttributeNS(null, 'filter', element.getAttribute('filter'))
        ellipse.setAttributeNS(null, 'rx', rx.toString())
        ellipse.setAttributeNS(null, 'ry', ry.toString())
        ellipse.setAttributeNS(null, 'cx', cx.toString())
        ellipse.setAttributeNS(null, 'cy', cy.toString())
        element.parentNode.replaceChild(ellipse, element);
      }
    });
  }

  toCircleNode(document: Document) {
    var rects: any = document.getElementsByTagName('rect');
    var list = Array.from(rects);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('rx') != null) {
        var ns = 'http://www.w3.org/2000/svg'
        var circle = document.createElementNS(ns, 'circle');
        var r = (((element.getAttribute('width') as unknown as number) / 2) * 0.9);
        var cx = (+(element.getAttribute('x') as unknown as number) + (r * 1.12));
        var cy = (+(element.getAttribute('y') as unknown as number) + (r * 0.7));
        circle.setAttributeNS(null, 'filter', element.getAttribute('filter'))
        circle.setAttributeNS(null, 'r', r.toString())
        circle.setAttributeNS(null, 'cx', cx.toString())
        circle.setAttributeNS(null, 'cy', cy.toString())
        element.parentNode.replaceChild(circle, element);
      }
    });
  }

  hideNotes() {
    var notes: any = document.getElementsByTagName('path');
    var list = Array.from(notes);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('class') == null) {
        element.setAttribute('display', 'none');
        element.setAttribute('name', 'note');
      }
    });
    var notes: any = document.getElementsByTagName('text');
    var list = Array.from(notes);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('font-size') == '12') {
        element.setAttribute('display', 'none');
        element.setAttribute('name', 'note');
      }
    });
    var rects: any = document.getElementsByTagName('rect');
    var list = Array.from(rects);
    list.forEach((element: SVGRectElement) => {
      if (element.getAttribute('rx') != null) {
        element.setAttribute('onmouseenter', 'ShowNotes()')
        element.setAttribute('onmouseleave', 'HideNotes()')
      }
    });
  }

  showNotes() {
    var notes: any = document.getElementsByName('note')
    var list = Array.from(notes);
    list.forEach((element: SVGRectElement) => {
      element.setAttribute('display', '');
    });
  }

  removeStyling() {
    this.removeStyleFrom('rect');
    this.removeStyleFrom('ellipse');
    this.removeStyleFrom('path');
    this.removeStyleFrom('line');
    this.removeStyleFrom('polygon');
    this.removeStyleFrom('polyline');
    this.removeStyleFrom('text');
  }

  removeStyleFrom(type) {
    Array.from(document.getElementsByTagName(type)).forEach(element => {
      if (element.getAttribute('fill') == 'none') {
        if (type == 'path')
          element.setAttribute('class', 'actor')
        element.setAttribute('class', element.getAttribute('class') + ' transparent')
      }
      element.removeAttribute('fill');
      if (element.getAttribute('style')) {
        if (element.getAttribute('style').includes('dasharray: 5.0,5.0')) {
          element.setAttribute('class', element.getAttribute('class') + ' dashed')
        }
        if (element.getAttribute('style').includes('dasharray: 2.0,2.0')) {
          element.setAttribute('class', element.getAttribute('class') + ' dotted')
        }
        if (element.getAttribute('style').includes('dasharray: 1.0,4.0')) {
          element.setAttribute('class', element.getAttribute('class') + ' skipped')
        }
        element.removeAttribute('style');
      }
    });
  }
}