import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';

// upload card to web ma ni aru kaha upload garxa rw 
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, referralCode } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const user = await User.findById(userId).select("firstName lastName email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const course = await Course.findById(courseId).select(
      "courseTitle courseDescription coursePrice courseThumbnail"
    );
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      userCart = new Cart({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        courses: [
          {
            course: {
              _id: course._id,
              courseTitle: course.courseTitle,
              courseDescription: course.courseDescription,
              coursePrice: course.coursePrice,
              courseThumbnail: course.courseThumbnail,
            },
            referralCode: referralCode || null,
          },
        ],
      });
    } else {
      const alreadyInCart = userCart.courses.some(
        (item) => item.course._id.toString() === courseId
      );

      if (alreadyInCart) {
        return res.status(400).json({ success: false, message: "Course already in cart" });
      }

      userCart.courses.push({
        course: {
          _id: course._id,
          courseTitle: course.courseTitle,
          courseDescription: course.courseDescription,
          coursePrice: course.coursePrice,
          courseThumbnail: course.courseThumbnail,
        },
        referralCode: referralCode || null,
      });
    }

    await userCart.save();
    res.status(200).json({ success: true, message: "Course added to cart", userCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// get cart 
export const getAllCarts = async (req, res) => {
  try {

    const carts = await Cart.find({}).populate('user._id', 'firstName lastName email');

    res.status(200).json({ success: true, carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// yesle course like green signal dinxa mero matlab ki payment vayasi complete vanyara validatwe garaidinxa 
export const validatePurchase = async (req, res) => {
  try {
    const { userId, courseId } = req.body;


    const userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }


    const courseItem = userCart.courses.find(
      (item) => item.course._id.toString() === courseId
    );

    if (!courseItem) {
      return res.status(404).json({ success: false, message: "Course not found in cart" });
    }

    courseItem.isValidated = true;
    const purchasingUser = await User.findById(userId);

    if (!purchasingUser.enrolledCourses.includes(courseId)) {
      purchasingUser.enrolledCourses.push(courseId);
    }

    if (!purchasingUser.affiliateCode) {
      const generatedCode = purchasingUser._id.toString().slice(-6);
      purchasingUser.affiliateCode = generatedCode;
    }

    if (courseItem.referralCode) {
      const referrer = await User.findOne({ affiliateCode: courseItem.referralCode });

      if (referrer && referrer._id.toString() !== userId) {
        referrer.affiliateEarnings += courseItem.course.coursePrice / 2;

        if (!purchasingUser.referredBy) {
          purchasingUser.referredBy = courseItem.referralCode;
        }

        await referrer.save();
      }
    }

    await purchasingUser.save();

    await new Purchase({
      courseId,
      userId,
      amount: courseItem.course.coursePrice,
      status: "completed"
    }).save();

    userCart.courses = userCart.courses.filter(
      (item) => item.course._id.toString() !== courseId
    );

    await userCart.save();

    res.status(200).json({ success: true, message: "Course validated, purchased, and removed from cart" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// getcoursedetails
export const getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;  

    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });


    const purchase = await Purchase.findOne({ courseId, userId, status: 'completed' });

    if (purchase) {
      course.courseContent = course.courseContent.map(chapter => ({
        ...chapter,
        chapterContent: chapter.chapterContent.map(lecture => ({
          ...lecture,
          isPreviewFree: true,
        })),
      }));
    } 

    return res.json(course);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};