
(function ($) {

  "use strict";
  
  var OptionManager = (function () {
    var objToReturn = {};

    var _options = null;
    var DEFAULT_OPTIONS = {
      currencySymbol: '$',
      classCartIcon: 'my-cart-icon',
      classCartBadge: 'my-cart-badge',
      classProductQuantity: 'my-product-quantity',
      classProductRemove: 'my-product-remove',
      classCheckoutCart: 'my-cart-checkout',
      affixCartIcon: true,
      showCheckoutModal: true,
      numberOfDecimals: 2,
      cartItems: null,
      clickOnAddToCart: function ($addTocart) {},
      afterAddOnCart: function (products, totalPrice, totalQuantity) {},
      clickOnCartIcon: function ($cartIcon, products, totalPrice, totalQuantity) {},
      checkoutCart: function (products, totalPrice, totalQuantity) {
        return false;
      },
      getDiscountPrice: function (products, totalPrice, totalQuantity) {
        return null;
      }
    };


    var loadOptions = function (customOptions) {
      _options = $.extend({}, DEFAULT_OPTIONS);
      if (typeof customOptions === 'object') {
        $.extend(_options, customOptions);
      }
    };
    var getOptions = function () {
      return _options;
    };

    objToReturn.loadOptions = loadOptions;
    objToReturn.getOptions = getOptions;
    return objToReturn;
  }());

  var MathHelper = (function () {
    var objToReturn = {};
    var getRoundedNumber = function (number) {
      if (isNaN(number)) {
        throw new Error('โปรดระบุเป็นตัวเลขจำนวนเต็ม');
      }
      number = number * 1;
      var options = OptionManager.getOptions();
      return number.toFixed(options.numberOfDecimals);
    };
    objToReturn.getRoundedNumber = getRoundedNumber;
    return objToReturn;
  }());

  var ProductManager = (function () {
    var objToReturn = {};

    /*
    PRIVATE
    */
    const STORAGE_NAME = "__mycart";
    localStorage[STORAGE_NAME] = localStorage[STORAGE_NAME] ? localStorage[STORAGE_NAME] : "";
    var getIndexOfProduct = function (id) {
      var productIndex = -1;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        if (value.id == id) {
          productIndex = index;
          return;
        }
      });
      return productIndex;
    };
    var setAllProducts = function (products) {
      localStorage[STORAGE_NAME] = JSON.stringify(products);
    };
    var addProduct = function (id,name,shopcode,price,quantity,onhand,salequantity,quantityrevise,stockin,stockiD,shopnameshort,image) {
      var products = getAllProducts();
      products.push({
        id:id,
        name:name,
        shopcode:shopcode,
        price:price,
        quantity:quantity,
        onhand:onhand,
        salequantity:salequantity,
        quantityrevise:quantityrevise,
        stockin:stockin,
        stockiD:stockiD,
        shopnameshort:shopnameshort,
        image:image
      });
      setAllProducts(products);
    };

    /*
    PUBLIC
    */
    var getAllProducts = function () {
      try {
        var products = JSON.parse(localStorage[STORAGE_NAME]);
        return products;
      } catch (e) {
        return [];
      }
    };
    var updatePoduct = function (id, quantity, increaseQuantity) {
      var productIndex = getIndexOfProduct(id);
      if (productIndex < 0) {
        return false;
      }
      var products = getAllProducts();
      if(increaseQuantity) {
        products[productIndex].quantity = products[productIndex].quantity * 1 + (typeof quantity === "undefined" ? 1 : quantity * 1);
      } else {
        products[productIndex].quantity = typeof quantity === "undefined" ? products[productIndex].quantity * 1 + 1 : quantity * 1;
      }
      setAllProducts(products);
      return true;
    };
    var setProduct = function (id,name,shopcode,price,quantity,onhand,salequantity,quantityrevise,stockin,stockiD,shopnameshort,image) {
      if (typeof id === "undefined") {
        console.error("id required");
        return false;
      }
      if (typeof name === "undefined") {
        console.error("name required");
        return false;
      }
      if (typeof image === "undefined") {
        console.error("image required");
        return false;
      }
      if (!$.isNumeric(price)) {
        console.error("โปรดระบุเป็นตัวเลข");
        return false;
      }
      if (!$.isNumeric(quantity)) {
        console.error("โปรดระบุเป็นตัวเลข");
        return false;
      }
     // summary = typeof summary === "undefined" ? "" : summary;

      if (!updatePoduct(id, quantity, true)) {
        addProduct(id,name,shopcode,price,quantity,onhand,salequantity,quantityrevise,stockin,stockiD,shopnameshort,image);
      }
    };
    
      var clearProduct = function () {
        setAllProducts([]);
      };
      var removeProduct = function (id) {
      var products = getAllProducts();
      products = $.grep(products, function (value, index) {
        return value.id != id;
      });
      setAllProducts(products);
    };
    var getTotalQuantity = function () {
      var total = 0;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        total += value.quantity * 1;
      });
      return total;
    };
    var getTotalPrice = function () {
      var products = getAllProducts();
      var total = 0;
      $.each(products, function (index, value) {
        total += value.quantity * value.price;
        total = MathHelper.getRoundedNumber(total) * 1;
      });
      return total;
    };
    var clearcart = function () {
      var $cartClear = $("#" + idCartClear);
      $cartClear.empty();
      localStorage[STORAGE_NAME] = [];
      //$("#" + idCartModal).modal('show');
    };

    objToReturn.getAllProducts = getAllProducts;
    objToReturn.updatePoduct = updatePoduct;
    objToReturn.setProduct = setProduct;
    objToReturn.clearProduct = clearProduct;
    objToReturn.Clearcart = clearcart;
    objToReturn.removeProduct = removeProduct;
    objToReturn.getTotalQuantity = getTotalQuantity;
    objToReturn.getTotalPrice = getTotalPrice;
    return objToReturn;
  }());


  var loadMyCartEvent = function (targetSelector) {

    var options = OptionManager.getOptions();
    var $cartIcon = $("." + options.classCartIcon);
    var $cartBadge = $("." + options.classCartBadge);
    var classProductQuantity = options.classProductQuantity;
    var classProductRemove = options.classProductRemove;
    var classCheckoutCart = options.classCheckoutCart;

    var idCartModal = 'my-cart-modal';
    var idCartTable = 'my-cart-table';
    var idCartClear = 'my-cart-clear';
    var idGrandTotal = 'my-cart-grand-total';
    var idEmptyCartMessage = 'my-cart-empty-message';
    var idDiscountPrice = 'my-cart-discount-price';
    var classProductTotal = 'my-product-total';
    var classAffixMyCartIcon = 'my-cart-icon-affix';


    if (options.cartItems && options.cartItems.constructor === Array) {
      ProductManager.clearProduct();
      $.each(options.cartItems, function () {
        ProductManager.setProduct(this.id, this.name, this.summary, this.price, this.quantity, this.image);
      });
    }

    $cartBadge.text(ProductManager.getTotalQuantity());
//  POP up Cart
    // if (!$("#" + idCartModal).length) {
    //   $('body').append(
    //     '<div class="modal fade" id="' + idCartModal + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
    //     '<div class="modal-dialog" role="document">' +
    //     '<div class="modal-content">' +
    //     '<div class="modal-header">' +
    //     '<button type="button" id="IDModal" class="close btn"  data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    //     '<h4 class="modal-title" id="myModalLabel"><span class="fas fa-shopping-cart"></span> My Cart</h4>' +
    //     '</div>' +
    //     '<div class="modal-body">' +
    //     '<table class="table table-hover table-responsive" id="' + idCartTable + '"></table>' +
    //     '</div>' +
    //     '<div class="modal-footer">' +
    //     '<button type="button" id="IDModal" class="btn btn-default " data-bs-dismiss="modal">Close</button>' +
    //     '<button type="button" class="btn btn-primary ' + classCheckoutCart + '">Checkout</button>' +
    //     '</div>' +
    //     '</div>' +
    //     '</div>' +
    //     '</div>'
    //   );
    // }

    var drawTable = function () {
      var $cartTable = $("#" + idCartTable);
      $cartTable.empty();
    // List Item In Cart
      var products = ProductManager.getAllProducts();
      $.each(products, function () {
        var total = this.quantity * this.price;
        $cartTable.append(
          '<tr title="' + this.summary + '" data-id="' + this.id + '" data-price="' + this.price +  ' "data-max="'+ this.stockin + '">' +
          '<td class="text-center" style="width: 40px;"><img width="30px" height="0px" src="' + this.image + '"/></td>' +
          '<td>' + this.name + '</td>' +
          '<td title="Unit Price" class="text-right">' + MathHelper.getRoundedNumber(this.price) + '</td>' +
          '<td title="Quantity"><input type="number" min="1" max="'+ this.stockin + '"  style="width: 70px; margin-left:5px;" class="' + classProductQuantity + '" value="' + this.quantity + '"/></td>' +
          '<td title="Total" class="text-right ' + classProductTotal + '">' + MathHelper.getRoundedNumber(total) + '</td>' +
          '<td title="Remove from Cart" class="text-center" style="width: 30px;"><a href="javascript:void(0);" class="btn btn-xs btn-danger ' + classProductRemove + '">X</a></td>' +
          '</tr>'
        );
      });
      //  Cal total and ck Is cart enpty
      $cartTable.append(products.length ?
        '<tr>' +
        '<td></td>' +
        '<td><strong>Total</strong></td>' +
        '<td></td>' +
        '<td></td>' +
        '<td class="text-right"><strong id="' + idGrandTotal + '"></strong></td>' +
        '<td></td>' +
        '</tr>' :
        '<div class="alert alert-danger" role="alert" id="' + idEmptyCartMessage + '">ไม่มีสินค้าในตะกร้า</div>'
      );

      //  discount  price
      var discountPrice = options.getDiscountPrice(products, ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      if (products.length && discountPrice !== null) {
        $cartTable.append(
          '<tr style="color: red">' +
          '<td></td>' +
         '<td><strong>Total (including discount)</strong></td>' +
          '<td></td>' +
          '<td></td>' +
          '<td class="text-right"><strong id="' + idDiscountPrice + '"></strong></td>' +
          '<td></td>' +
          '</tr>'
        );
      }

      showGrandTotal();
      showDiscountPrice();
    };
    var showModal = function () {
      drawTable();
      //$("#" + idCartModal).modal('show');
    };
    
    var updateCart = function () {
      $.each($("." + classProductQuantity), function () {
        var id = $(this).closest("tr").data("id");

        ProductManager.updatePoduct(id, $(this).val());
      });
    };
    var showGrandTotal = function () {
      $("#" + idGrandTotal).text( MathHelper.getRoundedNumber(ProductManager.getTotalPrice()));
    };
    var showDiscountPrice = function () {
      $("#" + idDiscountPrice).text( MathHelper.getRoundedNumber(options.getDiscountPrice(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity())));
    };

    /*
    EVENT
    */
    if (options.affixCartIcon) {
      var cartIconBottom = $cartIcon.offset().top * 1 + $cartIcon.css("height").match(/\d+/) * 1;
      var cartIconPosition = $cartIcon.css('position');
      $(window).scroll(function () {
        $(window).scrollTop() >= cartIconBottom ? $cartIcon.addClass(classAffixMyCartIcon) : $cartIcon.removeClass(classAffixMyCartIcon);
      });
    }

    $cartIcon.click(function () {
      options.showCheckoutModal ? showModal() : options.clickOnCartIcon($cartIcon, ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
    });
    
    $(document).ready(function(){
      options.showCheckoutModal ? showModal() : options.clickOnCartIcon($cartIcon, ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
    
    });

    $(document).on("input", "." + classProductQuantity, function () {
      var price = $(this).closest("tr").data("price");
      var id = $(this).closest("tr").data("id");
      var valuemax = $(this).closest("tr").data("max");
      var quantity = $(this).val();

      // ตั้งค่า ให้ใส่ตัวเลขได้ไม่เกินที่มี สต๊อกอยู่
      $(this).val(Math.min(valuemax, Math.max(1, $(this).val())));
      //$(this).val(Math.max(valuemax,$(this).val()));
      // console.log(id);
      // console.log(price);
      // console.log(valuemax);
      $(this).parent("td").next("." + classProductTotal).text( MathHelper.getRoundedNumber(price * quantity));
      ProductManager.updatePoduct(id, quantity);

      $cartBadge.text(ProductManager.getTotalQuantity());
      showGrandTotal();
      showDiscountPrice();
    });

    $(document).on('keypress', "." + classProductQuantity, function (evt) {
      if (evt.keyCode >= 48 && evt.keyCode <= 57) {
        return;
      }
      evt.preventDefault();
    });

    $(document).on('click', "." + classProductRemove, function () {
      var $tr = $(this).closest("tr");
      var id = $tr.data("id");
      $tr.hide(500, function () {
        ProductManager.removeProduct(id);
        drawTable();
        $cartBadge.text(ProductManager.getTotalQuantity());
        
      });
    });

    $(document).on('click', "." + classCheckoutCart, function () {
      var products = ProductManager.getAllProducts();
      if (!products.length) {
        $("#" + idEmptyCartMessage).fadeTo('fast', 0.5).fadeTo('fast', 1.0);
        return;
      }
      updateCart();
      var isCheckedOut = options.checkoutCart(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      if (isCheckedOut !== false) {
        drawTable();
        ProductManager.clearProduct();
        $cartBadge.text(ProductManager.getTotalQuantity());
         
        var $cartTable = $("#" + idCartTable);
      $cartTable.empty();
      //  เคลีย ข้อมูลเมื่อ บันทึกรายการเรียบร้อย
      $cartTable.append(
        '<div class="alert alert-danger" role="alert" >บันทึกรายการเรียบร้อย</div>'
      );
       // $("#" + idCartModal).modal("hide");
      }
     
    });

    $(document).on('click', targetSelector, function () {
      var $target = $(this);
      options.clickOnAddToCart($target);

      var id = $target.data('id');
      var name = $target.data('name');
      var shopcode = $target.data('shopcode');
      var price = $target.data('price');
      var quantity = $target.data('quantity');
      var onhand = $target.data('onhand');
      var salequantity = $target.data('salequantity');
      var quantityrevise = $target.data('quantityrevise');
      var stockin = $target.data('stockin');
      var stockiD = $target.data('stockiD');
      var shopnameshort = $target.data('shopnameshort');
      var image = $target.data('image');
      
     // var $cartTable = $("#" + idCartTable); 

      ProductManager.setProduct(id,name,shopcode,price,quantity,onhand,salequantity,quantityrevise,stockin,stockiD,shopnameshort,image);
      $cartBadge.text(ProductManager.getTotalQuantity());

      options.afterAddOnCart(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      drawTable();
      
    });

  };
  

  $.fn.myCart = function (userOptions) {
    OptionManager.loadOptions(userOptions);
    loadMyCartEvent(this.selector);
    return this;
  };
  $.fn.loadCart = function (userOptions) {
    OptionManager.loadOptions(userOptions);
    loadMyCartEvent(this.selector);
    return this;
  };


})(jQuery);