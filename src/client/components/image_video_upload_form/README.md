# Image Video Upload Form

A variation on the Image Upload Form, but accepts MP4 video as well.  Displays a video element for preview if src includes 'mp4'.

Use is the same as the Image Upload Form, use the admin_edit class to invoke in a jade file, and add a data-type of video in your form element.

## Example

````
.admin-image-placeholder(data-name="video" data-index=i data-type="video")
````